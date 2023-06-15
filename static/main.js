if(undefined === storeData('sessions')) {
	storeData('sessions', {});
}
$('.quiz-states').state('home');
$('.quiz-home-sessions').state('empty');
$(() => {
	function pressButton(selector) {
		const $btn = $(selector)
		if($btn.length == 0) {
			console.warn('cannot find button', selector)
		}
		const btn = $btn[0]
		if(btn.clientWidth > 0) {
			$(btn).click()
		} else {
			// console.log('ignored')
		}
	}
	addEventListener('keydown', (evt) => {
		// console.log(evt.key)
		if(evt.key == ' ') {
			pressButton('.quiz-control-check')
		} else if(evt.key == 'ArrowLeft') {
			pressButton('.quiz-control-prev')
		} else if(evt.key == 'ArrowRight') {
			pressButton('.quiz-control-next')
		} else if(evt.key == 'z') {
			pressButton('.quiz-control-clear')
			evt.preventDefault()
		} else if(evt.ctrlKey && evt.key == 's') {
			evt.preventDefault()
		}
	})
});
