const scriptName = "compile";
const cRoomList = [];
const roomList = [];

function response(room, msg, sender, isGroupChat, replier, imageDB, packageName) {
	if(cRoomList.includes(room) == true) {
		msg = msg.split(' ');
		
		if(msg[0][0] == '/') {
			// 컴파일
			if(msg[0] == '/c') {
				let scriptName = msg[1];
				
				if(Api.compile(scriptName)) {
					Api.off(scriptName);
					Api.on(scriptName);
					Api.replyRoom(room, '컴파일 되었습니다!');
				} else {
					Api.replyRoom(room, '컴파일에 실패 하였습니다.');
				}
			} else if(msg[0] == '/공지') {
				let txt = '[공지] \n';
				let nRoomList = [];
				
				for(var i = 1; i < msg.length; i++) {
					txt += msg[i] + ' ';
				}

				for(var i = 0; i < roomList.length; i++) {
					if (Api.canReply(roomList[i])){
						Api.replyRoom(roomList[i], txt);
						nRoomList.push(roomList[i]);
					}
				}
				
				txt = '[' + nRoomList.join(', ') + '] 방에 공지 완료.';
				Api.replyRoom(room, txt);
			}
		}
	}
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