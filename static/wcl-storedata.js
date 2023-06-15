// localStorage 本地存储值
// - data: 设置
// - undefined: 查询
// - null: 删除
function storeData(key='',val) {
	// 存储键
	var storeKey = 'quiz-training';

	// 判断模式
	var mode = 'set';
	if(val === undefined) {
		mode = 'get';
	} else if(val === null) {
		mode = 'remove';
	}

	// 取出数据
	var data = localStorage[storeKey];
	try {
		data = JSON.parse(data);
	} catch(_e) {
		data = {};
	}
	if(typeof(data) != 'object') {
		data = {};
	}

	// 寻址
	key = key.split('.');
	if(key.length == 1 && key[0] == '') {
		if(mode == 'get') {
			return data;
		} else if(mode == 'set') {
			return null;
		} else {
			delete localStorage[storeKey];
			return undefined;
		}
	}
	var curr = data;
	for(let i=0;i<key.length-1;i++) {
		var nxt = curr[key[i]];
		if(typeof(nxt) != 'object' || nxt === null) {
			// 正在设置且此处无内容
			if(mode == 'set' && nxt === undefined) {
				// 创建，然后重新赋值
				curr[key[i]] = {};
				nxt = curr[key[i]];
			} else {
				// 否则失败
				return null;
			}
		}
		curr = nxt;
	}
	// 末端寻址
	if(mode == 'set') {
		curr[key[key.length-1]] = val;
		localStorage[storeKey] = JSON.stringify(data);
		return val;
	} else if(mode == 'get') {
		return curr[key[key.length-1]];
	} else if(mode == 'remove') {
		// 删除值
		delete curr[key[key.length-1]];
		localStorage[storeKey] = JSON.stringify(data);
		return undefined;
	}
}

function fetch_json(url) {
	return new Promise((resolve, reject) => {
		$.ajax({
			type: 'GET',
			dataType: 'json',
			url: url,
			timeout: 15000,
			error: (e) => {
				resolve({
					success: false,
					code: -1,
					data: e
				});
			},
			success: (t) => {
				resolve(t);
			}
		});
	});
}

function isYes(text) {
	return text && text != '' && (text[0] == 'Y' || text[0] == 'y');
}

// 替换XML
function escapeXml(unsafe) {
	if(undefined === unsafe) unsafe = 'undefined';
	return unsafe.toString().replace(/[<>&'"]/g, function (c) {
		switch (c) {
			case '<': return '&lt;';
			case '>': return '&gt;';
			case '&': return '&amp;';
			case '\'': return '&apos;';
			case '"': return '&quot;';
		}
	});
}
