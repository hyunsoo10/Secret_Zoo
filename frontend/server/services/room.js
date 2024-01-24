
import { Server } from 'socket.io';
import models from '../models/models.js';

const model = models();

const {animals, 
  score,
  Player,
  roomInfo} = model

const roomSocketMethods = () => {

  /**
     * 카드 셔플 후 분배
     * @param {Object} room 방 객체
     * @returns 
     */
  const shuffleArray = (room) => {
    let array = room.card
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }

    let i = 20;
    console.log(`##### room card : ${room.card}`);

    while(i > 0){
      i--;
      for(let k = 0 ; k < room.playerCount ; k ++){
        room.player[k].hand.push(room.card.pop());
        if(room.card.length===0){
          break;
        }
      }
    }
  }

  /**
   * 방 생성 (방이 존재하지 않는 경우)
   * @param {string} roomName 방 이름 
   * @param {string} id 유저 id 
   */
  const addRoom = (rooms, roomName, playerId, socketId)=>{
    rooms[roomName] = {...roomInfo};
    rooms[roomName].roomName = roomName;
    rooms[roomName].players.push(Player(playerId, socketId));

    /*TODO - send room data to backend server!!! */

    console.log(`##### create room : ${rooms[roomName].players}`);
  }

  /**
   * 유저 추가 (방이 존재하는 경우)
   * @param {string} roomName 방 이름
   * @param {string} id 유저 id 
   */
  const addPlayer = (rooms, roomName, playerId, socketId) => {
    const room = rooms[roomName];
    room.playerCount ++;
    room.players.push({...Player(playerId, socketId)});

    /*TODO - send room data and playerdata to backend server */

  }

  /**
   * 유저 퇴장 
   * @param {String} roomName 
   * @param {String} playerId 
   */
  const removePlayer = (playerId) => {
    const room = rooms[roomName];
    room.playerCount ++;
    room[playerCount] = new Player(playerId);

    /*TODO - send room data and playerdata to backend server */

  }

  /**
   * Socket IO 관련 함수들 정의
   */

  /* 방 정보 전달 */  
  const sendRoomInfo = async (socket, io,  rooms) => {
    socket.on('requestRoomsInfo', (callback) => {
      console.log("##### callback roomsInfo");
      callback(rooms);
    });
  }

  /* 방 생성 이벤트 */
  const createRoom = async(socket, io, rooms) => {
    socket.on('createRoom', (room, id, callback) => {
      if(Object.keys(rooms).includes(room)){
        callback(false);
      }else{
        addRoom(rooms, room, id, socket.id);
        console.log(`##### player [${socket.id}], make room ${room}`)

        // 기존방 나가기
        for(let nowRoom of socket.rooms){
          if(nowRoom !== socket.id){
            socket.leave(nowRoom);
          }
        }

        // 입력받은 방 들어가기
        socket.join(room);
        callback(true);
      }
    });
  }

  /* 방 입장 이벤트 */
  const enterRoom = async (socket, io, rooms) => {
    socket.on('enterRoom', (room, id, callback) => {
        // 인원수 체크
      if(rooms[room] && rooms[room].playerCount >= 6){
        callback(false);
      }else {
        // 기존방 나가기
        for(let nowRoom of socket.rooms){
          if(nowRoom !== socket.id){
            socket.leave(nowRoom);
          }
        }

        // 입력받은 방 들어가기
        socket.join(room);

        // console.log(io.of('/').adapter.rooms);
        socket.emit('updateRoom',rooms);
        addPlayer(rooms, room, id, socket.id)
        callback(true)
        console.log(`##### player ${socket.id} join room : ${rooms}`);
      }
    });
  }

  /* 채팅 메세지 이벤트 */
  const chatMessage = async(socket, io, rooms) => {
    socket.on('chatMessage', async (msg, user) => {
      let room;
      for(let nowRoom of socket.rooms){
        if(nowRoom !== socket.id){
          room = nowRoom;
        }
      }
      console.log(`##### chat message : ${msg} + " / room : " + ${room}`);
      io.to(room).emit('chatMessage', user + " : " + msg + "," + room); 
    });
  }


  /* 게임시작 카드 나눠주기 */
  const cardShare = async (socket, io, rooms) => {
    socket.on('start', () => {
      console.log(`##### card room : ${rooms}`);
      let room;
        for(let nowRoom of socket.rooms){
          if(nowRoom !== socket.id){
            room = nowRoom;
          }
        }
        console.log('##### 셔플시작')
        shuffleArray(rooms[room]);

        console.log('##### 셔플끝')
        
        for(let k = 0 ; k < 6 ; k ++ ){
          io.to(rooms[room].player[k].playerId).emit('game start', rooms[room].player[k].hand)
        }
        
      console.log(`#####  card ended : ${rooms}`);
    });
  }

  /** 방 정보 테스트 구동  */
  const testRoomsInfo = async(socket, io, rooms) => {
    socket.on('testRoomsInfo', (callback) =>{
      console.log("####")
      callback(rooms);
    })
  }

  return {
    sendRoomInfo,
    createRoom,
    enterRoom,
    chatMessage,
    cardShare,
    testRoomsInfo,
  }
}

export default roomSocketMethods;