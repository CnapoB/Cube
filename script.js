var now=[]; //массив текущего состояния в виде: [номер положения элемента, координаты базовой точки: x,y,z]
var box=[]; //сборочный массив "коробок" 
var canbe=[]; //массив возможных положений в определенной точке для перечисления
var visual=[]; //массив ячеек таблиц визуализации
var viscyc={}; //объект элементов страницы для визуализации
var interval=false; //интервал обновления визуализации сборки
//глобальные параметры
var X=5; //длина "коробка"
var Y=5; //ширина "коробка"
var Z=5; //высота "коробка"
var cyc=0; //число циклов
var bit=0; //число "переборов" за цикл
var bits=0; //общее число "переборов"
var starttime; //время запуска

var isworker=false; //использовали ли worker при запуске
var iWorker;

//24 положения элемента в трехмерном пространстве
//x,y,z
var elems=[
	[[0,0,0],[1,0,0],[1,1,0],[2,1,0],[3,1,0]],//0
	[[0,0,0],[1,0,0],[2,0,0],[0,0,1],[-1,0,1]],//1
	[[0,0,0],[1,0,0],[1,-1,0],[2,-1,0],[3,-1,0]],//2
	[[0,0,0],[1,0,0],[1,0,1],[2,0,1],[3,0,1]],//3
	[[0,0,0],[1,0,0],[2,0,0],[2,-1,0],[3,-1,0]],//4
	[[0,0,0],[1,0,0],[2,0,0],[2,0,1],[3,0,1]],//5
	[[0,0,0],[1,0,0],[2,0,0],[2,1,0],[3,1,0]],//6
	[[0,0,0],[1,0,0],[0,0,1],[-1,0,1],[-2,0,1]],//7
	[[0,0,0],[0,1,0],[1,1,0],[1,2,0],[1,3,0]],//8
	[[0,0,0],[0,1,0],[0,1,1],[0,2,1],[0,3,1]],//9
	[[0,0,0],[0,1,0],[-1,1,0],[-1,2,0],[-1,3,0]],//10
	[[0,0,0],[0,1,0],[0,2,0],[0,0,1],[0,-1,1]],//11
	[[0,0,0],[0,1,0],[0,2,0],[-1,2,0],[-1,3,0]],//12
	[[0,0,0],[0,1,0],[0,0,1],[0,-1,1],[0,-2,1]],//13
	[[0,0,0],[0,1,0],[0,2,0],[1,2,0],[1,3,0]],//14
	[[0,0,0],[0,1,0],[0,2,0],[0,2,1],[0,3,1]],//15
	[[0,0,0],[0,0,1],[0,0,2],[0,1,2],[0,1,3]],//16
	[[0,0,0],[0,0,1],[0,0,2],[-1,0,2],[-1,0,3]],//17
	[[0,0,0],[0,0,1],[0,0,2],[0,-1,2],[0,-1,3]],//18
	[[0,0,0],[0,0,1],[0,0,2],[1,0,2],[1,0,3]],//19
	[[0,0,0],[0,0,1],[0,1,1],[0,1,2],[0,1,3]],//20
	[[0,0,0],[0,0,1],[-1,0,1],[-1,0,2],[-1,0,3]],//21
	[[0,0,0],[0,0,1],[0,-1,1],[0,-1,2],[0,-1,3]],//22
	[[0,0,0],[0,0,1],[1,0,1],[1,0,2],[1,0,3]]//23
];

//глобальные параметры длин константных массивов
var E=elems.length; //число используемых положений в пространстве
var P=E>0?elems[0].length:0; //число точек (кубов) в элементе головоломки

//предстартовая подготовка
function prestart()
{
	//на всякий случай очищаем "коробок" и массив возможных положений
	box=[];
	canbe=[];
	var x,y,z,e,p,i;
	var dx,dy,dz;
	//создаем массив возможных положений и пустой "коробок"
	for(z=0;z<Z;++z)
	{
		canbe[z]=[];
		box[z]=[];
		for(y=0;y<Y;++y)
		{
			canbe[z][y]=[];
			box[z][y]=[];
			for(x=0;x<X;++x)
			{
				canbe[z][y][x]=[];
				box[z][y][x]=-1;
				for(e=0;e<E;++e)
				{
					for(p=0;p<P;++p)
					{
						//dx,dy,dz - абсолютные координаты точек положения элемента
						dx=elems[e][p][0]+x;
						dy=elems[e][p][1]+y;
						dz=elems[e][p][2]+z;
						if(dx<0 || dx>=X || dy<0 || dy>=Y || dz<0 || dz>=Z)
							break;
					}
					if(p>=P) canbe[z][y][x].push(e);
				}
			}
		}
	}
	//заполняем "коробок" из строки сохранения
	for(i=0;i<now.length;++i)
	{
		x=now[i][1];
		y=now[i][2];
		z=now[i][3];
		for(p=0;p<P;++p)
		{
			dx=elems[now[i][0]][p][0]+x;
			dy=elems[now[i][0]][p][1]+y;
			dz=elems[now[i][0]][p][2]+z;
			box[dz][dy][dx]=now[i][0];
		}
	}
	//создаем срезы, заполняем массивы ячеек таблиц визуализации и объект элементов страницы
	var d=document.getElementById('table');
	if(d) d.parentNode.removeChild(d);
	d=document.createElement('TABLE');
	d.id='table';
	var tr=document.createElement('TR');
	d.appendChild(tr);
	visual=[];
	for(z=0;z<Z;++z)
	{
		visual[z]=[];
		var td=document.createElement('TD');
		tr.appendChild(td);
		td.className='td';
		var tbl=document.createElement('TABLE');
		td.appendChild(tbl);
		for(y=0;y<Y;++y)
		{
			visual[z][y]=[];
			var trtbl=document.createElement('TR');
			tbl.appendChild(trtbl);
			for(x=0;x<X;++x)
			{
				var tdtbl=document.createElement('TD');
				tdtbl.className='tdtbl';
				visual[z][y][x]=tdtbl;
				trtbl.appendChild(tdtbl);
			}
		}
	}
	document.body.appendChild(d);
	viscyc={
		cycles:document.getElementById('cycles'),
		bit:document.getElementById('bit'),
		bits:document.getElementById('bits'),
		startline:document.getElementById('startline'),
		time:document.getElementById('time')
	};
}

//визуализация
function writenow()
{
	//отображаем циклы, переборы и массив текущего состояния в виде строки сохранения
	++cyc;
	var d=viscyc.cycles;
	if(d) d.innerHTML=cyc;
	d=viscyc.bits;
	if(d) d.innerHTML=bits;
	d=viscyc.bit;
	if(d) d.innerHTML=bit;
	bit=0;
	d=viscyc.startline;
	if(d) d.value=JSON.stringify(now);
	d=viscyc.time;
	if(d) d.innerHTML=(Date.now()-starttime)/1000;
	//заполняем срезы
	var x,y,z;
	for(x=0;x<X;++x)
	{
		for(y=0;y<Y;++y)
		{
			for(z=0;z<Z;++z)
			{
				d=visual[z][y][x];
				if(d)
				{
					d.style.background='';
					d.innerHTML=(box[z][y][x]>-1)?box[z][y][x]:'';
				}
			}
		}
	}
	//окрашиваем ячейки
	var p,r,g,b,l;
	for(i=0;i<now.length;++i)
	{
		l=i;
		r=(l%3+1)*63;
		l=Math.floor(l/3);
		g=(l%3+1)*63;
		l=Math.floor(l/3);
		b=(l%3+1)*63;
		for(p=0;p<P;++p)
		{
			x=elems[now[i][0]][p][0]+now[i][1];
			y=elems[now[i][0]][p][1]+now[i][2];
			z=elems[now[i][0]][p][2]+now[i][3];
			d=visual[z][y][x];
			if(d)
				d.style.background='rgb('+r+','+g+','+b+')';
		}
	}
}

//устанавливаем или убираем элемент в "коробке"
function settomatrix(i,x,y,z,s)
{
	if(s==undefined) s=true;
	var p,dx,dy,dz;
	for(p=0;p<P;++p)
	{
		dx=elems[i][p][0]+x;
		dy=elems[i][p][1]+y;
		dz=elems[i][p][2]+z;
		box[dz][dy][dx]=(s?i:-1);
	}
}

//может ли элемент быть помещен в эту точку
function icanbethere(i,x,y,z)
{
	var p,dx,dy,dz;
	for(p=0;p<P;++p)
	{
		dx=elems[i][p][0]+x;
		dy=elems[i][p][1]+y;
		dz=elems[i][p][2]+z;
		if(box[dz][dy][dx]>-1)
			return false;
	}
	return true;
}

function cycle()
{
	++bit;
	++bits;
	//выбираем первый свободный уровень (базовый уровень) и первую свободную точку
	var x,y,z,i,j,p;
	for(z=0;z<Z;++z)
	{
		for(y=0;y<Y;++y)
		{
			for(x=0;x<X;++x)
			{
				if(box[z][y][x]<0)
					break;
			}
			if(x<X) break;
		}
		if(y<Y) break;
	}
	var lasti=-1;
	if(z>=Z) //не нашли точку - поиск окончен
	{
		console.log('Не нашли точку');
		if(isworker)
			stopworker();
		else
			stop();
		return;
	}
	while(true)//ищем, подбираем
	{
		//берем свободную клетку и пытаемся в нее впихнуть все подряд (в соответствии с массивом возможных положений)
		var J=canbe[z][y][x].length;
		var startj=0;
		if(lasti>-1) //если предыдущий вариант не подошел, продолжаем поиск в той же точке
		{
			for(j=0;j<J;++j)
				if(canbe[z][y][x][j]==lasti) break;
			if(j<J) startj=j+1;
			//отсутствует следующий вариант для данной точки и удаленный элемент был первым в списке, меняем положение первого элемента
			if(startj>=J && now.length<=0)
			{
				++x;
				if(x>=X)
				{
					x=0;
					++y;
				}
				if(y>=Y)
				{
					console.log('Решение невозможно');
					//это была последняя возможная клетка, решение невозможно
					if(isworker)
						stopworker();
					else
						stop();
					return;
				}
			}
			lasti=-1;
		}
		//подбираем элементы в найденной свободной клетке, если подходит, заполняем "коробочку" и добавляем в массив текущего состояния
		for(j=startj;j<J;++j)
		{
			i=canbe[z][y][x][j];
			if(icanbethere(i,x,y,z))
			{
				now.push([i,x,y,z]);
				settomatrix(i,x,y,z,true);
				break;
			}
		}
		if(j>=J)
		{
			//для свободной клетке ничего не подошло, меняем предыдущее найденное положение и ищем заново (вначале меняем элемент, затем положение), удаляем элемент из "коробочки" и массива текущего состояния
			var nl1=now.length-1;
			if(nl1>=0)
			{
				lasti=now[nl1][0];
				x=now[nl1][1];
				y=now[nl1][2];
				z=now[nl1][3];
				settomatrix(lasti,x,y,z,false);
				now.pop();
			}
		} else break;
	}
}

//высоконагруженный цикл расчетов. Работает, пока существует интервал визуализации
function startcycle()
{
	for(var i=0;i<50000;++i)
	{
		cycle();
		if(!interval) break;
	}
	if(interval) setTimeout(startcycle,1);
}

//высоконагруженный цикл для worker'а
function workercycle()
{
	var i=0;
	while(true)
	{
		cycle();
		//отправляем сообщения для визуализации каждые 50000 переборов, т.к. при работе этого цикла событие onmessage не обрабатывается
		if(i>=50000 || !iswork)
		{
			i=0;
			postMessage({type:'set',name:'now',data:now});
			postMessage({type:'set',name:'bit',data:bit});
			postMessage({type:'set',name:'bits',data:bits});
			postMessage({type:'set',name:'box',data:box});
			postMessage({type:'set',name:'iswork',data:iswork});
			bit=0;
		}
		if(!iswork)
			break;
		++i;
	}
	//закрываем worker
	close();
}

//функция паузы/остановки поиска
function stop()
{
	//остановка через отправку сообщений не работает, т.к. в цикле worker не обрабатывает событие onmessage, поэтому просто отрубаем его
	if(isworker && iWorker)
		iWorker.terminate();
	var b=document.getElementById('startbutton');
	if(!b) return;
	//останавливаем периодическую визуализацию
	if(interval)
	{
		clearInterval(interval);
		interval=false;
	}
	//выполняем визуализацию в контрольной точке
	writenow();
	b.value='Старт';
}

//функция остановки worker'а
function stopworker()
{
	iswork=false;
}

//функция запуска/продолжения поиска
function start()
{
	starttime=Date.now();
	var b=document.getElementById('startbutton');
	//восстановление текущего состояния из строки "сохранения"
	var d=document.getElementById('startline');
	if(d && d.value!='')
	{
		var a=JSON.parse(d.value);
		if(a instanceof Array) now=JSON.parse(d.value); else now=[];
	}
	else now=[];
	b.value='Стоп';
	//выполняем предстартовую подготовку
	prestart();
	//проверяем возможность использования worker
	d=document.getElementById('isworker');
	isworker=(d && d.checked && !!window.Worker);
	if(isworker)
	{
		//запускаем worker, передавать будем {type:'тип передачи данных',name:'имя',data:данные}
		iWorker=new Worker("worker.js");
		//пишем обработчик данных
		iWorker.onmessage=function(ev)
		{
			//console.log(ev.data);
			if(ev.data.name && ev.data.type=='set')
			{
				switch(ev.data.name)
				{
					case 'now': now=ev.data.data; break;
					case 'bit': bit=ev.data.data; break;
					case 'bits': bits=ev.data.data; break;
					case 'box': box=ev.data.data; writenow(); break;
					case 'iswork': if(!ev.data.data) stop(); break;
				}
			}
		};
		//определяем массив имен данных, которые следует отправить
		var postarray=['now','box','canbe','X','Y','Z','bit','bits','elems','E','P','isworker'];
		//отправляем данные
		for(var i=0;i<postarray.length;++i)
			iWorker.postMessage({type:'set',name:postarray[i],data:window[postarray[i]]});
		//запускаем работу
		iWorker.postMessage('start');
	}
	else
	{
		//запускаем цикл
		interval=setInterval(writenow,1000);
		startcycle();
	}
	//выполняем визуализацию в контрольной точке
	writenow();
}

