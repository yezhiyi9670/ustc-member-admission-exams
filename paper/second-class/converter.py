import json

manifest = json.load(open("manifest.json", 'r', encoding='UTF-8'))

data = {
	'manifest': manifest,
	'problems': []
};
problems:list = data['problems']
curr_problem = None

with open("problems.txt", 'r', encoding='UTF-8') as fp:
	lines = fp.readlines()
	for line in lines:
		line = line.strip()
		if line == '':
			continue
		elif '0123456789'.find(line[0]) != -1:
			# 题干行
			splitter = line.find('.')
			id = int(line[0:splitter].strip())
			desc = line[splitter+1:].strip()
			splitter2 = desc.rfind('(')
			answer = desc[splitter2 + 1 : -1].strip()
			assert('ABCD'.find(answer) != -1)
			desc = desc[0 : splitter2].strip()
			new_prob = {
				'id': id,
				'desc': desc,
				'choice': {},
				'answer': answer
			}
			problems.append(new_prob)
			curr_problem = new_prob
		elif line[0] == 'A' or line[0] == 'C':
			# 选项行
			nextChoice = ''
			choice1key = 'A'
			choice2key = 'B'
			if line[0] == 'A':
				nextChoice = 'B.'
				choice1key = 'A'
				choice2key = 'B'
			else:
				nextChoice = 'D.'
				choice1key = 'C'
				choice2key = 'D'
			splitter = line.find(nextChoice)
			choice1 = line[2:splitter].strip()
			choice2 = line[splitter+2:].strip()
			curr_problem['choice'][choice1key] = choice1
			curr_problem['choice'][choice2key] = choice2
			pass
		else:
			raise SyntaxError('Unidentified Line ' + line)

json.dump(data, open('paper.json', 'w', encoding='UTF-8'), ensure_ascii=False)
