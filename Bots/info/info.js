const scriptName = "info";
// 지원 카톡방 리스트
const roomList = [];
const expAll = FileStream.read('/sdcard/Download/Bots/info/exp_all.txt').split('\n');
const typeList = ['파프', '앱솔', '앜셰', '방어구']; // 0 1 2 3
const optList = [
[0.12, 0.176, 0.242, 0.32, 0.41], 
[0.15, 0.22, 0.3025, 0.4, 0.5125], 
[0.18, 0.264, 0.363, 0.48, 0.615]
];

// Todo 방무 추가
// 계산 = 실방무 * (몬스터방어율 / 100)1 - ((몬스터방어율 / 100) * (1 - ))
function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
	if(roomList.includes(room) == true) {
		let data = msg.split(' ');
		if(data[0][0] == '!') {
			if(data[0] == '!검색') {
				let name = data[1];
				
				if(name === undefined || name == "") {
					Api.replyRoom(room, "[사용법]\n!검색 <캐릭터명>");
				} else if(Api.canReply(room)) {
					let result = getCharacterData(name);
					Api.replyRoom(room, result);
				}
			} else if(data[0] == '!이벤트') {
				if(Api.canReply(room)) {
					Api.replyRoom(room, getEvent());
				}
			} else if(data[0] == '!점검') {
				if(Api.canReply(room)) {
					Api.replyRoom(room, getNotice());
				}
			} else if(data[0] == '!추옵') { 
				let type = data[1];
				let stat = data[2];
				
				if(type === undefined || type == "" || typeList.includes(type) == false) {
					Api.replyRoom(room, "[사용법]\n!추옵 <파프|앱솔|앜셰|방어구> <무기기본공/마|방어구렙제>");
				} else if(stat === undefined || stat == "" || isNaN(stat) == true) {
					Api.replyRoom(room, "[사용법]\n!추옵 <파프|앱솔|앜셰|방어구> <무기기본공/마|방어구렙제>");
				} else if(Api.canReply(room)) {
					Api.replyRoom(room, getOption(type, stat));
				}
			} else if(data[0] == '!경매장') {
				let itemName = data[1];
				let count = data[2];
				
				if(count === undefined || count === '' || isNaN(count) == true) {
					count = -1;
				}
				
				if(Api.canReply(room)) {
					Api.replyRoom(room, getMarket(itemName, count));
				}
			} else if(data[0] == '!방무') {
				let base = data[1];
				let DIList = data.slice(2);
				let checkData = true;
				
				for(var i = 0; i < DIList.length; i++) {
					if(isNaN(DIList[i]) == true || DIList[i] === undefined || DIList[i] == '') {
						checkData = false;
					} else {
						DIList[i] = parseFloat(DIList[i]);
					}
				}
				
				let txt = '';
				if(base === undefined || base === '' || isNaN(base) == true) {
					txt = "[사용법]\n!방무 <보스방어율> <스텟창방무> <추가방무1> <추가방무2>...";
				} else if (checkData == false){
					txt = "[사용법]\n!방무 <보스방어율> <스텟창방무> <추가방무1> <추가방무2>...";
				} else {
					txt = getDefenseIgnore(base, DIList);
				}
				
				if(Api.canReply(room)) {
					Api.replyRoom(room, txt);
				}
			} else {
				let noticeText = "[사용 명령어 리스트]\n" + 
								"!검색 <캐릭터명> - 캐릭터 정보\n" + 
								"!이벤트 - 진행중인 이벤트 정보\n" + 
								"!점검 - 예정된 점검/업데이트 확인\n" + 
								"!추옵 <파프|앱솔|앜셰|방어구> <무기기본공/마|방어구렙제>\n" + 
								"!경매장 <아이템이름>(띄어쓰기제외) [<개수>]\n" + 
								"!방무 <보스방어율> <스텟창방무> <추가방무1> <추가방무2>..." + 
								"제작자: 사령주의 (leeapp@esllo.com)";

				if(Api.canReply(room)) {
					Api.replyRoom(room, noticeText);
				}
			}
		}
	}
}

function getMarket(itemName, count){
	try {
		itemName = itemName.replace('%', '');
		let mapleggURL = "https://maple.market/items/" + itemName + "/%EC%8A%A4%EC%B9%B4%EB%8B%88%EC%95%84";
		
		let data = org.jsoup.Jsoup.connect(mapleggURL).get();
		
		// 리스트, 시세
		let auctionList = data.select("#auction-list > table > tbody > tr");
		
		let isGetCount = true;
		let temp = auctionList.get(0).select("td.text-left > div > span");
		let maxSize = auctionList.size();
		let getSize = 0;
		// 장비템 체크
		if(temp === undefined || temp == '') {
			isGetCount = false;
		}
		
		// 사이즈 체크
		if(maxSize > 10) {
			maxSize = 10;
		}
		
		let parseDataList = [];
		
		for(var i = 0; i < auctionList.size(); i++) {
			let tmpData = auctionList.get(i).select("td");
			let dCount = tmpData.select("td.text-left > div > span").text();
			let txt = [];
			// 소비, 기타템 | 가격, 개당 가격, 남은 시간 (3)
			// 장비템 | 추옵, 잠재능력, 에디셔널, 가격, 개당 가격, 남은 시간 (6)
			if(count != -1 && dCount != count) {
				continue;
			}
			for(var j = 2; j < tmpData.size(); j++) {
				txt.push(tmpData.get(j).text());
			}
			parseDataList.push('['+ dCount + '] ' + txt.join(' / '));
			getSize += 1;
			if(getSize == maxSize) {
				break;
			}
		}
		// 장비템 | 추옵, 잠재능력, 에디셔널, 가격, 개당 가격, 남은 시간
		let label = '추옵 / 잠재능력 / 에디셔널 / 가격 / 개당 가격 / 남은 시간\n';
		if(isGetCount == true) { // 소비, 기타템 | 가격, 개당 가격, 남은 시간
			label = '가격 / 개당 가격 / 남은 시간\n';
		}
		
		let rstText = "경매장 [" + itemName + "] 아이템 검색 결과" + '\u200b'.repeat(500) + 
						label + parseDataList.join('\n') + 
						'\n\n해당 기능은 현재 오류가 있을 수 있습니다.\n제보는 [사령주의] 귓말이나 봇 개인톡으로 보내주시면 감사하겠습니다.';
					
		return rstText;
    } catch(e) {
		Api.replyRoom('이헌우', itemName + '경매장 정보 에러: \n' + e);
		
		let errText = "아이템 정보를 찾을 수 없습니다.";
		return errText;
    }
}

function getCharacterData(name) {
	try {
		let mapleggURL = "https://maple.gg/u/" + name;
		
		let data = org.jsoup.Jsoup.connect(mapleggURL).get();
		// 레벨, 직업, 인기도
		let summaryList = data.select("li.user-summary-item");
		// 무릉, 시드, 유니온, 업적
		let floorList = data.select("div.row.text-center > div > section > div");
		// 종합, 월드, 직업(월드), 직업(전체)
		let rankList = data.select("div.col-lg-2.col-md-4.col-sm-4.col-6.mt-3");
		
		// 실제 데이터
		let nickname = data.select("b.align-middle").text();
		let server = data.select("li.character-card-summary-item > span").get(0).text();
		let guild = data.select("a.text-yellow.text-underline").text();
		let level = summaryList.get(0).text();
		let job = summaryList.get(1).text();
		let pop = summaryList.get(2).text().replace("인기도 ", "");
		let dojang = floorList.get(0).text();
		let seed = floorList.get(1).text();
		let union = floorList.get(2).text();
		let achive = floorList.get(3).text();
		let totalRank = rankList.get(0).text();
		let worldRank = rankList.get(1).text();
		let jobWorldRank = rankList.get(2).text();
		let jobTotalRank = rankList.get(3).text();
		let lastUpdate = data.select("span.d-block.font-weight-light").text();
		//끝
		let expList = getExp(nickname);
		
		let rstText = '[' + nickname + "] 검색 결과" + '\u200b'.repeat(500) +
					"\n\n서버: " + server +
					"\n길드: " + guild +
					"\n레벨: " + level + " (" + expList[0] + ")" + 
					"\n(" + expList[3] + ")" + 
					"\n직업: " + job +
					"\n인기도: " + pop +
					"\n\n무릉: " + dojang +
					"\n더시드: " + seed +
					"\n유니온: " + union +
					"\n업적: " + achive +
					"\n\n" + totalRank +
					"\n" + worldRank +
					"\n" + jobWorldRank +
					"\n" + jobTotalRank +
					"\n\n" + expList[1] + 
					"\n" + expList[2] + 
					"\n\n" + lastUpdate;
					
		return rstText;
		// return [nickname, server, guild, level, job, pop, dojang, seed, union, achive, totalRank, worldRank, jobWorldRank, jobTotalRank, lastUpdate];
    } catch(e) {
		Api.replyRoom('이헌우', name + ' 캐릭 정보 에러: \n' + e);
		
		let errText = "캐릭터 정보를 찾을 수 없습니다.";
		return errText;
    }
}

function getExp(name) {
	try {
		let mapleURL = "https://maplestory.nexon.com/Ranking/World/Total?c=" + name;
		
		let data = org.jsoup.Jsoup.connect(mapleURL).get();
		
		let tempList = data.select("tr.search_com_chk > td");
		let level = parseInt(tempList.get(2).text().replace("Lv.", ""));
		let exp = parseInt(tempList.get(3).text().replace(/,/gi, ""));
		
		let curExp = (exp / (parseInt(expAll[level - 1]) - parseInt(expAll[level - 2]))) * 100;
		curExp = curExp.toFixed(2) + "%";
		
		let leftExp = parseInt(expAll[level - 1]) - parseInt(expAll[level - 2]) - exp;
		let toNextLevel = leftExp / 100000000;
		toNextLevel = "Lv." + (level + 1) + "까지 " + toNextLevel.toFixed(4) + '억 남음.';
		
		let to250 = (parseInt(expAll[248]) - parseInt(expAll[level - 2]) - exp) / 1000000000000;
		let to275 = (parseInt(expAll[273]) - parseInt(expAll[level - 2]) - exp) / 1000000000000;
		to250 = 'Lv.250까지 ' + to250.toFixed(4) + '조 남음.';
		to275 = 'Lv.275까지 ' + to275.toFixed(4) + '조 남음.';
		if(level >= 250) {
			to250 = "Lv.250까지 이미 달성 ㄷㄷ";
			toNextLevel = leftExp / 1000000000000;
			toNextLevel = "Lv." + (level + 1) + "까지 " + toNextLevel.toFixed(4) + '조 남음.';
		} 
		if(level == 275) {
			to275 = "Lv.275까지 이미 달성 ㄷㄷ";
		}
		
		return [curExp, to250, to275, toNextLevel];
		
	} catch(e) {
		Api.replyRoom('이헌우', name + ' 경험치 에러: \n' + e);
		
		return ["0%", "Lv.250까지 - ", "Lv.275까지 -", "다음레벨까지 - "];
    }
}

function getEvent() {
	try {
		let mapleURL = "https://maplestory.nexon.com/"
		let eventURL = mapleURL + "/News/Event";
		
		let data = org.jsoup.Jsoup.connect(eventURL).get();
		
		let eventList = data.select("div.event_board > ul > li");
		let size = eventList.size();
		let evList = [];
		for(var i = 0; i < size; i++) {
			evList.push((i + 1) + ". " + eventList.get(i).text());
		}
		
		let rstText = "진행중인 이벤트 리스트" + '\u200b'.repeat(500) +
					'\n' + evList.join('\n');
		return rstText;
	} catch(e) {
		Api.replyRoom('이헌우', '이벤트 명령어 에러: \n' + e);
		
		let errText = '예기치 못한 오류가 발생하였습니다.';
		return errText;
    }
}

function getNotice(){
	try {
		let mapleURL = "https://maplestory.nexon.com/";
		let noticeURL = mapleURL + "/News/Notice/Inspection";
		
		let data = org.jsoup.Jsoup.connect(noticeURL).get();
		
		let noticeList = data.select("div.news_board > ul > li");
		let size = noticeList.size();
		let rstArr = [];
		
		
		for(var i = 0; i < size; i++) {
			var temp = String(noticeList.get(i).select('p').text());
			if(temp.indexOf("완료") == -1) {
				rstArr.push(temp);
			}
		}
		
		let rstText = '';
		if(rstArr.length == 0) {
			rstText = "예정된 점검/업데이트가 없습니다.";
		} else {
			rstText = rstArr.join('\n');
		}
		
		return rstText;
	} catch(e) {
		Api.replyRoom('이헌우', '점검 명령어 에러: \n' + e);
		
		let errText = '예기치 못한 오류가 발생하였습니다.';
		return errText;
    }
}

function getOption(type, stat){ // type = 악셰 // stat = 숫자
	let typeIndex = typeList.findIndex((x) => x == type); // 
	let temp = optList[typeIndex];
	let txt = '';
	
	if(typeIndex <= 2) {	// 무기
		txt += type + '무기 추옵 \n기본 공/마 [' + stat + ']\n - [5, 4, 3, 2, 1] 추\n - ';
		
		let ta = [];
		for(var i = 0; i < 5; i++) {
			ta.push(Math.ceil(stat * temp[i]));
		}
		txt += ta.join(', ');
	} else {	// 아머
		txt += '[' + stat + ']렙제 방어구 추옵' + '\u200b'.repeat(500) + 
				'\n - [1, 2, 3, 4, 5] 단계\n';
		
		// 단일 스텟
		let ti = Math.floor(stat / 20) + 1; // 상수
		txt += '단일 스텟 추옵\n - ';
		let ta = []; // tempArray
		for(var i = 3; i < 8; i++) {
			ta.push(i * ti); // 3, 4, 5, 6, 7
		}
		txt += ta.join(', ') + '\n';
		
		// 이중 스텟
		ti = Math.floor(stat / 40) + 1; // 상수
		txt += '이중 스텟 추옵\n - ';
		ta = []; // tempArray
		for(var i = 3; i < 8; i++) {
			ta.push(i * ti);
		}
		txt += ta.join(', ') + '\n';
		// HP/MP
		txt += 'MaxHP/MP 추옵\n - ';
		ta = []; // tempArray
		for(var i = 3; i < 8; i++) {
			ta.push(stat * 3 * i);
		}
		txt += ta.join(', ');
	}

	return txt;
}

function getDefenseIgnore(base, DIList){
	let _time = parseFloat(base) / 100.0;
	let realDI = 0.0;
	
	for(var i = 0; i < DIList.length; i++) {
		realDI += ((100 - realDI) * (parseFloat(DIList[i]) / 100));
	}
	let realDeal = 100 - (_time * (100 - realDI));
	
	let txt = '실 방무: ' + realDI.toFixed(2) + '%\n방어율 ' + base + '% 보스에게 적용되는 딜량: ' + realDeal.toFixed(2) + '%';
	
	return txt;
}

//아래 4개의 메소드는 액티비티 화면을 수정할때 사용됩니다.
function onCreate(savedInstanceState, activity) {
  var textView = new android.widget.TextView(activity);
  textView.setText("Hello, World!");
  textView.setTextColor(android.graphics.Color.DKGRAY);
  activity.setContentView(textView);
}

function onStart(activity) {}

function onResume(activity) {}

function onPause(activity) {}

function onStop(activity) {}