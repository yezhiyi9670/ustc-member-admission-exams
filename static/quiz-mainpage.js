(() => {

	window.MainPage = new (function() {
		/**
		 * 主页，显示试卷列表
		 */
		this.showPapers = function() {
			$('.quiz-papers-list').children().remove();

			let papers = Papers.available_list();
			for(let paper of papers) {
				$('.quiz-papers-list').append(
					$('<p></p>').append(
						$('<a></a>').addClass('quiz-paper-link')
						.attr('href', 'javascript:;')
						.text(paper.name)
						.on('click', () => {
							this.openPaper(paper.id);
						})
					)
				);
			}
		}

		/**
		 * 验证会话名称是否符合要求
		 */
		this.validateSessionName = function(name) {
			return name.length > 3 && name.indexOf('.') == -1;
		}

		/**
		 * 用试卷创建会话并打开
		 */
		this.openPaper = async function(id) {
			let name = prompt('新会话的名称（不可修改，不能包含点，长度至少 4）\n使用重复的名称将覆盖原有会话');
			if(name === null) {
				return;
			}
			if(!this.validateSessionName(name)) {
				alert('名称 ' + name + ' 不符合要求。');
				return;
			}
			let shouldShuffle = prompt('你是否希望随机排列题目？[y/N]');
			if(shouldShuffle === null) {
				return;
			}
			$('.quiz-states').state('fetching');
			let paperData = await Papers.fetchData_async(id);
			if(!paperData) {
				alert('获取试卷数据失败。');
				$('.quiz-states').state('home');
				return;
			}
			let new_sess = new Session();
			new_sess.createFromPaper(name, paperData, isYes(shouldShuffle));
			new_sess.saveSession();
			this.showSessions();
			this.currentSession = new_sess;
			$('.quiz-states').state('summary');
			this.showSessionSummary();

			window.sendAnalyticsEvent('Create paper')
		}
		/**
		 * 创建错题强化练并打开
		 */
		this.createReinforcement = async function(id) {
			let name = prompt('新会话的名称（不可修改，不能包含点，长度至少 4）\n使用重复的名称将覆盖原有会话');
			if(name === null) {
				return;
			}
			if(!this.validateSessionName(name)) {
				alert('名称 ' + name + ' 不符合要求。');
				return;
			}
			let shouldShuffle = prompt('你是否希望再次随机排序所有错题？[y/N]');
			if(shouldShuffle === null) {
				return;
			}
			let new_sess = new Session();
			new_sess.createFromSession(name, this.currentSession, isYes(shouldShuffle));
			new_sess.saveSession();
			this.showSessions();
			this.currentSession = new_sess;
			$('.quiz-states').state('summary');
			this.showSessionSummary();

			window.sendAnalyticsEvent('Create exercise')
		}

		/**
		 * 主页，显示会话列表
		 */
		this.showSessions = function() {
			$('.quiz-sessions-list').children().remove();
			
			let sessions = storeData('sessions');
			let has_content = false;
			for(let sess_name in sessions) {
				has_content = true;
				let session = sessions[sess_name];
				$('.quiz-sessions-list').append(
					$('<p></p>').append(
						$('<a></a>').addClass('quiz-session-link')
						.attr('href', 'javascript:;')
						.text(session.manifest.name)
						.on('click', () => {
							this.openSession(session.manifest.name);
						})
					)
				);
			}
			if(has_content) {
				$('.quiz-home-sessions').state('sessions');
			} else {
				$('.quiz-home-sessions').state('empty');
			}
		}

		/**
		 * 打开会话进入概览页面
		 */
		this.openSession = function(name) {
			let new_sess = new Session();
			new_sess.restoreSession(name);
			this.currentSession = new_sess;
			$('.quiz-states').state('summary');
			this.showSessionSummary();

			$('html')[0].scrollTop = 0;
		}
		/**
		 * 删除会话并退回到主页
		 */
		this.deleteSession = function() {
			let resp = prompt('确定删除此会话？操作不可撤销！[y/N]');
			if(!isYes(resp)) {
				return;
			}
			if(this.currentSession) {
				this.currentSession.deleteSavedData();
			}
			this.currentSession = null;
			$('.quiz-states').state('home');
			this.showSessions();

			window.sendAnalyticsEvent('Delete session')
		}
		/**
		 * 重命名会话并刷新
		 */
		this.renameSession = function() {
			let resp = prompt('请输入新名称（不可修改，不能包含点，长度至少 4）\n使用已有的名称将覆盖原有会话', this.currentSession.manifest.name);
			if(!this.validateSessionName(resp)) {
				alert('名称 ' + resp + ' 不符合要求。');
				return;
			}
			this.currentSession.deleteSavedData();
			this.currentSession.manifest.name = resp;
			this.currentSession.saveSession();
			
			this.showSessionSummary();
		}

		this.currentSession = null;
		this.currentIndex = -1;

		/**
		 * 显示会话概览页面内容
		 */
		this.showSessionSummary = function() {
			// 名称
			$('.sess-name').text(this.currentSession.manifest.name);
			// 统计信息
			let statData = this.currentSession.stat();
			$('.num-total').text(statData.total);
			$('.num-done').text(statData.done);
			$('.num-incorrect').text(statData.incorrect);
			$('.percent-correct').text(((1 - statData.incorrect / statData.done) * 100).toFixed(1));

			// 决定“继续作答”按钮的状态
			let continueIndex = this.currentSession.getContinueIndex();
			if(-1 == continueIndex) {
				$('.quiz-btn-continue').hide();
			} else {
				$('.quiz-btn-continue').show();
			}
			// 决定“强化训练”按钮的状态
			if(statData.incorrect == 0) {
				$('.quiz-btn-reinforce').hide();
			} else {
				$('.quiz-btn-reinforce').show();
			}

			// 显示题目列表
			let $problist = $('.quiz-problems-summary');
			$problist.children().remove();
			for(let i = 0; i < this.currentSession.problems.length; i++) {
				let additional_class = '';
				let state = this.currentSession.getProblemState(i);
				if(state == "undone" && this.currentSession.problems[i].judged) {
					state = 'checkonly';
				}
				if(state != "undone") {
					additional_class = ` problem-tile-${state}`;
				}
				$problist.append(
					$('<a></a>').addClass('problem-tile' + additional_class)
					.attr('href', 'javascript:;')
					.append(
						$('<span></span>').addClass('problem-ordinal')
						.text(i + 1)
					)
					.append(
						$('<span></span>').addClass('wcl-spacer')
					)
					.append(
						$('<span></span>').addClass('problem-id')
						.text(this.currentSession.getProblemId(i))
					)
					.on('click', () => {
						this.currentIndex = i;
						this.openProblem();
					})
				);
			}
		}
		/**
		 * 继续作答
		 */
		this.continueProblems = function() {
			this.currentIndex = this.currentSession.getContinueIndex();
			this.openProblem();
		}
		/**
		 * 进入答题页面
		 */
		this.openProblem = function() {
			$('.quiz-states').state('problem');
			this.renderProblemPage();
			$('html')[0].scrollTop = 0;
		}
		/**
		 * 翻页上
		 */
		this.turnPrev = function() {
			if(this.currentIndex > 0) {
				this.currentIndex -= 1;
			}
			this.renderProblemPage();
			$('html')[0].scrollTop = 0;
		}
		/**
		 * 翻页下
		 */
		this.turnNext = function() {
			if(this.currentIndex < this.currentSession.problems.length - 1) {
				this.currentIndex += 1;
			}
			this.renderProblemPage();
			$('html')[0].scrollTop = 0;
		}
		/**
		 * 答题界面键盘操作的 listener
		 */
		this.keyListeners = []
		/**
		 * 显示答题界面内容
		 */
		this.renderProblemPage = function() {
			// 名称
			$('.sess-name').text(this.currentSession.manifest.name);
			// 统计信息
			let statData = this.currentSession.stat();
			$('.num-total').text(statData.total);
			$('.num-done').text(statData.done);
			$('.num-incorrect').text(statData.incorrect);
			$('.percent-correct').text(((1 - statData.incorrect / statData.done) * 100).toFixed(1));
			// 当前题号
			$('.num-current').text(this.currentIndex + 1);
			$('.id-current').text(this.currentSession.getProblemId(this.currentIndex));

			let problem = this.currentSession.problems[this.currentIndex];
			// 类型
			let typeDesc = '单选';
			if(problem.type == 'multi') {
				typeDesc = '多选';
			} else if(problem.type == 'blank') {
				typeDesc = '填空';
			}
			$('.quiz-content-type').text(typeDesc);
			// 题目内容
			$('.quiz-content-desc').text(problem.desc);
			$('.quiz-content-extras').children().remove();
			if(problem.extras) {
				for(let line of problem.extras) {
					$('.quiz-content-extras').append(
						$('<p></p>').text(line)
					);
				}
			}

			if(problem.type == 'blank') {
				$('.quiz-blank-answer-field').text(problem.answer);
				if(!problem.judged) {
					$('.quiz-blank-tips').show();
					$('.quiz-blank-answer').hide();
				} else {
					$('.quiz-blank-tips').hide();
					$('.quiz-blank-answer').show();
				}
			} else {
				$('.quiz-blank-tips').hide();
				$('.quiz-blank-answer').hide();
			}

			let pushChoice = (id, text, state) => {
				let iconText = id;
				if(state == 'correct') {
					iconText = "✓";
				} else if(state == 'incorrect') {
					iconText = "✕";
				} else if(state == 'modify') {
					iconText = "★";
				}

				const choice = $('<a></a>')
					.addClass(`quiz-choice quiz-choice-${state}`)
					.attr('href', 'javascript:;')
					.attr('quiz-choice', id)
					.attr('ondragstart', 'return false;')
					.append(
						$('<div></div>').addClass('quiz-choice-icon')
						.append(
							$('<span></span>').addClass('quiz-choice-id')
							.text(iconText)
						)
					)
					.append(
						$('<div></div>').addClass('quiz-choice-text')
						.text(text)
					)
					.on('click', () => {
						this.markChoice(id);
					})
				$('.quiz-choices').append(
					choice
				);
				const handleKeyDown = (evt) => {
					if(evt.key == id.toLowerCase() && choice.height() > 0) {
						choice.click()
					}
				}
				addEventListener('keydown', handleKeyDown)
				this.keyListeners.push(handleKeyDown)
			}
			this.keyListeners.forEach((lst) => {
				removeEventListener('keydown', lst)
			})
			$('.quiz-choices').children().remove();
			let choices = problem.choice;
			let correctAnswer = problem.answer;
			if(problem.type == 'blank') {
				choices = {
					"A": "好，我中了",
					"B": "这啥呀这是？"
				};
				correctAnswer = 'A';
			}
			// 选项
			if(problem.type != 'blank' || problem.judged) {
				for(let choice_id in choices) {
					let state = 'undone';
					let isJudged = problem.judged;
					let isSelected = -1 != (problem.studentAnswer ?? '').indexOf(choice_id);
					let isCorrect = -1 != (correctAnswer ?? '').indexOf(choice_id);

					if(isJudged) {
						if(isSelected) {
							if(isCorrect) {
								state = 'correct';
							} else {
								state = 'incorrect';
							}
						} else {
							if(isCorrect && problem.type != 'blank') {
								state = 'modify';
							}
						}
					} else {
						if(isSelected) {
							state = 'select';
						}
					}
					let choice_text = choices[choice_id];
					pushChoice(choice_id, choice_text, state);
				}
			}
		}
		/**
		 * 选择选项
		 */
		this.markChoice = function(choice) {
			let problem = this.currentSession.problems[this.currentIndex];
			if(problem.type == 'multi') {
				if(problem.studentAnswer == null) {
					problem.studentAnswer = '';
				}
				if(problem.studentAnswer.indexOf(choice) == -1) {
					problem.studentAnswer += choice;
				} else {
					problem.studentAnswer = problem.studentAnswer.split('').filter((x) => x != choice).join('');
				}
				problem.studentAnswer = problem.studentAnswer.split('').sort().join('');
				if(problem.studentAnswer == '') {
					problem.studentAnswer = null;
				}
			} else {
				problem.studentAnswer = choice;

				if(!problem.judged) {
					const problemState = this.currentSession.problemState(problem)
					if(problemState == 'correct') {
						window.sendAnalyticsEvent('Answer correct')
					} else if(problemState == 'incorrect') {
						window.sendAnalyticsEvent('Answer incorrect')
					}
				}

				problem.judged = true;
			}
			
			$.dethrottle(() => {
				if(this.currentSession) {
					this.currentSession.saveSession();
				}
			}, 500)();
			this.renderProblemPage();
		}
		/**
		 * 清除选项
		 */
		this.clearChoice = function() {
			let problem = this.currentSession.problems[this.currentIndex];

			if(problem.studentAnswer === null) {
				return
			}

			problem.studentAnswer = null;
			problem.judged = false;
			$.dethrottle(() => {
				if(this.currentSession) {
					this.currentSession.saveSession();
				}
			}, 500)();
			this.renderProblemPage();

			window.sendAnalyticsEvent('Clear problem')
		}
		/**
		 * 检查答案
		 */
		this.checkAnswer = function() {
			let problem = this.currentSession.problems[this.currentIndex];
			
			if(problem.judged) {
				return
			}
			
			problem.judged = true;
			$.dethrottle(() => {
				if(this.currentSession) {
					this.currentSession.saveSession();
				}
			}, 500)();
			this.renderProblemPage();

			if(problem.type == 'blank') {
				$('html')[0].scrollTop = 114514;
			}

			if(problem.type != 'blank') {
				const problemState = this.currentSession.problemState(problem)
				if(problemState == 'correct') {
					window.sendAnalyticsEvent('Answer correct')
				} else if(problemState == 'incorrect') {
					window.sendAnalyticsEvent('Answer incorrect')
				}
			}
		}
		/**
		 * 返回概览界面
		 */
		this.backToSummary = function() {
			this.currentIndex = -1;
			$('.quiz-states').state('summary');
			this.showSessionSummary();
		}

		/**
		 * 回到主页并刷新会话列表
		 */
		this.backToMain = function() {
			currentSession = null;
			$('.quiz-states').state('home');
			this.showSessions();
		}
		
	})();

})();

$(() => {
	MainPage.showPapers();
	MainPage.showSessions();
});
