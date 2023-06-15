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
			answer = desc[-1]
			desc = desc[0:-1].strip()
			assert('ABCD'.find(answer) != -1)
			new_prob = {
				'id': id,
				'desc': desc,
				'extras': [],
				'choice': {},
				'answer': answer
			}
			problems.append(new_prob)
			curr_problem = new_prob
		elif '①②③④⑤⑥⑦⑧⑨⑩'.find(line[0]) != -1:
			# 组合选项行
			curr_problem['extras'].append(line.strip())
		elif 'ABCD'.find(line[0]) != -1:
			# 选项行
			splitter = line.find('.')
			option = line[0]
			option_text = line[splitter+1:].strip()
			curr_problem['choice'][option] = option_text
			pass
		else:
			raise SyntaxError('Unidentified Line ' + line)

json.dump(data, open('paper.json', 'w', encoding='UTF-8'), ensure_ascii=False)
