//загружаем функции рассчета
importScripts('script.js');

//пишем обработчик сообщений для установки переменных внутри worker'а и его запуска
onmessage=function(ev)
{
	if(ev.data.name)
	{
		if(ev.data.type=='set')
		{
			switch(ev.data.name)
			{
				case 'now': now=ev.data.data; break;
				case 'box': box=ev.data.data; break;
				case 'canbe': canbe=ev.data.data; break;
				case 'X': X=ev.data.data; break;
				case 'Y': Y=ev.data.data; break;
				case 'Z': Z=ev.data.data; break;
				case 'bit': bit=ev.data.data; break;
				case 'bits': bits=ev.data.data; break;
				case 'elems': elems=ev.data.data; break;
				case 'E': E=ev.data.data; break;
				case 'P': P=ev.data.data; break;
				case 'isworker': isworker=ev.data.data; break;
				case 'iswork': iswork=ev.data.data; break;
			}
		}
	}
	else if(ev.data=='start')
	{
		iswork=true;
		setTimeout(workercycle,1);
	}
};