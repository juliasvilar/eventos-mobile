import Parse from "parse/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

Parse.setAsyncStorage(AsyncStorage);
Parse.initialize(
  "0rhnfphxSQMrOhOkku9pZ9fsDQUeNgrdn6h4Ei19",
  "AQ6crGeH1NZloKa6VKf860TAlPGiWi3yW89XNDIV"
);
Parse.serverURL = "https://parseapi.back4app.com/";

export default Parse;
