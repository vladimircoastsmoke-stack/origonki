export const SOCKET_EVENTS = {
  // Admin
  ADMIN_CREATE_ROOM: 'admin:createRoom',
  ADMIN_UPLOAD_LOGO: 'admin:uploadLogo',
  ADMIN_SELECT_CITY: 'admin:selectCity',
  ADMIN_SET_CARS: 'admin:setCars',
  ADMIN_START_COUNTDOWN: 'admin:startCountdown',
  ADMIN_RESTART_RACE: 'admin:restartRace',
  ADMIN_JOIN_ROOM: 'admin:joinRoom',
  ADMIN_NEW_GAME: 'admin:newGame',
  ADMIN_SET_MAX_PLAYERS: 'admin:setMaxPlayers',
  ADMIN_CLOSE_ROOM: 'admin:closeRoom',
  ADMIN_ADD_DEMO_BOT: 'admin:addDemoBot',

  // Player
  PLAYER_JOIN: 'player:join',
  PLAYER_SELECT_CAR: 'player:selectCar',
  PLAYER_VOLUME: 'player:volume',
  PLAYER_REJOIN: 'player:rejoin',

  // Big Screen
  BIGSCREEN_JOIN: 'bigscreen:join',

  // Server
  SERVER_ROOM_UPDATE: 'server:roomUpdate',
  SERVER_RACE_FINISHED: 'server:raceFinished',
  SERVER_ERROR: 'server:error',
  SERVER_COUNTDOWN_TICK: 'server:countdownTick',
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
