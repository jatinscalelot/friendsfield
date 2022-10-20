const BASE_URL = window.location.origin + "/";
const AUTO_LOGOUT = window.location.origin + "/login";
const ACCESS_TOKEN = "ACCESSTOKEN";
const USER_ROLE = "USER_ROLE";
const CHANNEL_DATA = "channelID";
const UNIQID = "UNIQUSERID";
const app = angular.module("FriendsField", ["btford.socket-io"]);