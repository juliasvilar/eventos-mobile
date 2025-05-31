import Parse from "parse/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

Parse.setAsyncStorage(AsyncStorage);
Parse.initialize(
  "y252xv9Jnq4yizmwdMoY9zmbrxOOLZVL3GHtEZYZ",
  "1vBaGqMBudDhIyPk2ttwb64HLuGldk2gjjx5lWdm"
);
Parse.serverURL = "https://parseapi.back4app.com/";

export default Parse;
