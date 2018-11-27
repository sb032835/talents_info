module.exports = function talentsinfo(mod) {
	const command = mod.command || mod.require.command;
	const softcap = 0.8901403358192;
	let warned = false;
	let lvl = 0,
		exp = 0,
		dexp = 0,
        dcap = 0,
		sdcap = 0;

    // message on command
    command.add(['talent', 'talents', 'EP', '!EP'], msg);

    // send message exp/cap (exp%)
    function msg()
	{
        	command.message(`<font color="#FDD017">特性訊息:</font> 等級 <font color="#17fdd2">${lvl}</font>, EXP: <font color="#17fdd2">${exp}</font>`);
		command.message(`今日EXP <font color="#17fdd2">${dexp}/${sdcap}</font><font color="#17fdd2"><font color="#FFF380"> (${Math.round(100*dexp/sdcap)}%) </font>`);
	}
	
	mod.hook('S_LOAD_EP_INFO', 1, event=>{
		exp = event.exp;
		lvl = event.level;
		dexp = event.dailyExp;
		dcap = event.dailyExpMax;
		sdcap = Math.floor(dcap*softcap);
	});
	
	mod.hook('S_CHANGE_EP_EXP_DAILY_LIMIT', 1, event=>{
		dcap = event.limit;
		sdcap = Math.floor(dcap*softcap);
	});
	
	mod.hook('S_PLAYER_CHANGE_EP', 'raw', (code, data)=>{
		let gained = data.readInt32LE(4);
		exp = data.readInt32LE(8); // 64 actually but this should be enough
		lvl = data.readInt32LE(16);
		dexp = data.readInt32LE(20);
		dcap = data.readInt32LE(24);
		sdcap = Math.floor(dcap*softcap);
		let scmod = Math.round(data.readFloatLE(37) * 100);
		if(gained)
		{
			if(dexp >= sdcap)
			{
				if(!warned)
				{
					command.message('<font color="#FDD017">特性EXP</font> 每日上限 <font color="#FF0000">己到達!</font>');
					warned = true;
				}
			}
			else
			{
				warned = false;
			}
			command.message('<font color="#17fdd2">+' + gained + ' exp</font>' );
			command.message((!warned ? '每日額度 (<font color="#FFF380">' + dexp + ' </font>/ ' + sdcap + ') , 剩餘 <font color="#FFF380">' + (sdcap-dexp) + '</font> exp': ' (' + scmod + '% mod)' ));
		}
	});
	
	// open EP ui
    mod.hook('C_REQUEST_CONTRACT', 1, event => {
        if (event.type == 77)
		{
            msg();
        }
	});
};
