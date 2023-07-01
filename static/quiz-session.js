(() => {

	window.Session = function() {

		this.manifest = {
			name: '',
			createTime: 0
		};
		this.problems = [];

		this.fromDataObject = function(obj) {
			if(obj) {
				this.manifest = obj.manifest;
				this.problems = obj.problems;
			}
			for(let problem of this.problems) {
				// 对 judged 值进行补充，兼容 20221117 之前的会话数据。
				if(undefined === problem.judged) {
					problem.judged = null !== problem.studentAnswer;
					// console.log(problem);
				}
			}
		};
		this.toDataObject = function() {
			return {
				manifest: this.manifest,
				problems: this.problems,
			};
		};
		
		/**
		 * 从题目对象推断题目状态
		 * 
		 * @returns undone | correct | incorrect
		 */
		this.problemState = function(problem) {
			if(problem.studentAnswer === null || !problem.judged) {
				return 'undone';
			}
			if(problem.type != 'blank') {
				if(problem.studentAnswer == problem.answer.trim()) {
					return 'correct';
				}
			} else {
				if(problem.studentAnswer == 'A') {
					return 'correct';
				}
			}
			return 'incorrect';
		};

		/**
		 * 加载数据存储
		 */
		this.restoreSession = function(name) {
			this.fromDataObject(storeData('sessions.' + name));
		}
		/**
		 * 保存数据
		 */
		this.saveSession = function() {
			storeData('sessions.' + this.manifest.name, this.toDataObject());
		}

		/**
		 * 从试卷创建会话
		 */
		this.createFromPaper = function(name, paperData, doRandomShuffle) {
			this.manifest.name = name;
			this.manifest.createTime = +new Date();
			this.problems = [];
			for(let i = 0; i < paperData.problems.length; i++) {
				let problem = paperData.problems[i];
				if(problem.type == 'multi') {
					problem.answer = problem.answer.split('').sort().join('');
				}
				problem.studentAnswer = null;
				this.problems.push(problem);
			}
			if(doRandomShuffle) {
				this.problems.sort(() => Math.random() - 0.5);
			}
		}
		/**
		 * 从已完成的会话创建错题加强练
		 */
		this.createFromSession = function(name, session, doRandomShuffle) {
			this.manifest.name = name;
			this.manifest.createTime = +new Date();
			this.problems = [];
			for(let i = 0; i < session.problems.length; i++) {
				let problem = session.problems[i];
				if('incorrect' == this.problemState(problem)) {
					problem.studentAnswer = null;
					problem.judged = false;
					this.problems.push(problem);
				}
			}
			if(doRandomShuffle) {
				this.problems.sort(() => Math.random() - 0.5);
			}
		}
		/**
		 * 删除数据
		 */
		this.deleteSavedData = function() {
			storeData('sessions.' + this.manifest.name, null);
		}

		/**
		 * 统计总题数、完成数和错误数
		 * 
		 * @return {total: 514, done: 114, incorrect: 81}
		 */
		this.stat = function() {
			statData = {total: 0, done: 0, incorrect: 0};
			for(let problem of this.problems) {
				statData.total += 1;
				if(this.problemState(problem) != 'undone') {
					statData.done += 1;
					if(this.problemState(problem) == 'incorrect') {
						statData.incorrect += 1;
					}
				}
			}

			return statData;
		}

		/**
		 * 获取题目的题号
		 */
		this.getProblemId = function(index) {
			return this.problems[index].id;
		}

		/**
		 * 获取题目的状态
		 * @return undone | correct | incorrect
		 */
		this.getProblemState = function(index) {
			let problem = this.problems[index];
			return this.problemState(problem);
		}

		/**
		 * 获取最后一个已作答试题的下一个（下标）
		 * @return nextIndex | -1
		 */
		this.getContinueIndex = function(index) {
			let lastIndex = -1;
			for(let i = 0; i < this.problems.length; i++) {
				if(this.problems[i].studentAnswer !== null) {
					lastIndex = i;
				}
			}
			if(lastIndex + 1 >= this.problems.length) {
				return -1;
			}
			return lastIndex + 1;
		}

	}

})();
