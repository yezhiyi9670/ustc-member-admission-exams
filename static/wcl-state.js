/**
 * 状态切换
 */
(() => {
	$.fn.state = function(str, attrName = 'wcl-state') {
		if(str === undefined) {
			return undefined;
		}
		this.hide();
		this.filter('[' + attrName + '=' + str + ']:not([wcl-state-disabled=true])').show();
		return this;
	};
	$.dethrottle = (func, timeout) => {
		let timer = null;
		return function() {
			let context = this;
			let args = arguments;
			if(timer) {
				clearTimeout(timer);
			}
			timer = setTimeout(() => func.apply(context, args), timeout);
		}
	};
})();
