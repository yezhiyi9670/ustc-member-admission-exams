(() => {

	window.Papers = new (function() {
		this.available_list = function() {
			return [
				{name: "近代史纲要 2022A 第一部分", id: "modern-history-2022s-vol1"},
				{name: "近代史纲要 2022A 第二部分", id: "modern-history-2022s-vol2"},
				{name: "思想政治 2022A 第一部分", id: "politics2022a-vol1"},
				{name: "思想政治 2022A 第二部分", id: "politics2022a-vol2"},
				{name: "处分条例（官方题库 2022）", id: "rules"},
				{name: "第二课堂（官方题库 2022）", id: "second-class"},
				{name: "学习指南（2022 背数字专项练，可能有错漏，后果自负）", id: "study-guide"},
				{name: "多选题功能测试（无实质内容）", id: "multichoice"}
			]
		}
		this.fetchData_async = async function(id) {
			return await fetch_json('./paper/' + id + '/paper.json?ts=' + (+ new Date()));
		}
	})();

})();
