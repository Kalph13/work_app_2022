import { React, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Dimensions, StyleSheet, Text, View, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { theme } from './color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Fontisto, FontAwesome5, Entypo } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const STORAGE_KEY = "@toDos";
const TAB_KEY = "@tab";

export default function App() {
  const [ category, setCategory ] = useState(1);
  const [ text, setText ] = useState("");
  const [ toDos, setToDos ] = useState({});
  const [ inEdit, setInEdit ] = useState(false);
  const [ editText, setEditText ] = useState("");

  const done = false;
  const edit = false;
  
  useEffect(() => {
    loadToDos();
    loadTab();
  }, []);

  const clickTab = async (tab) => {
    setCategory(tab);
    saveTab(tab);
  };
  const saveTab = async (tab) => {
    try {
      await AsyncStorage.setItem(TAB_KEY, JSON.stringify(tab));
    } catch (e) {
      console.log(e);
    }
  };
  const loadTab = async () => {
    const toLoad = await AsyncStorage.getItem(TAB_KEY);
    setCategory(JSON.parse(toLoad));
  };

  const onChangeText = (payload) => setText(payload);
  const onChangeEdit = (payload) => setEditText(payload);

  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.log(e);
    }
  };
  const loadToDos = async () => {
    const toLoad = await AsyncStorage.getItem(STORAGE_KEY);
    if(toLoad) setToDos(JSON.parse(toLoad));
  };

  const toggleToDo = async (key) => {
    const newToDos = {...toDos};
    newToDos[key].done = !newToDos[key].done;
    setToDos(newToDos);
    await saveToDos(newToDos);  
  };
  const addToDo = async () => {
    if(text === "") return;
    const newToDos = {...toDos, [Date.now()]: {text, category, done, edit}}
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const editClick = (key) => {
    setInEdit(!inEdit);
    toDos[key].edit = !toDos[key].edit;
  };
  const editToDo = async (key) => {
    if(editText === "") {
      editClick(key);
      return;
    }
    const newToDos = {...toDos};
    newToDos[key].text = editText;
    newToDos[key].edit = !newToDos[key].edit;
    setToDos(newToDos);
    await saveToDos(newToDos);
    setEditText("");
  };
  const deleteToDo = (key) => {
    Alert.alert(
      "Delete the Checklist",
      "Are You Sure?",
      [
        {text: "OK", onPress: async () => {
          const newToDos = {...toDos};
          delete newToDos[key];
          setToDos(newToDos);
          await saveToDos(newToDos);  
        }},
        {text: "Cancel"}
      ]
    );
  };

  const deleteAll = () => {
    Alert.alert(
      "Delete All the Checklists",
      "Are You Sure?",
      [
        {text: "OK", onPress: async () => {
          setToDos({});
          await saveToDos(toDos);
        }},
        {text: "Cancel"}
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => clickTab(1)}>
          <Text style={{...styles.buttonText, color: category === 1 ? theme.darkgrey : theme.lightmint, fontWeight: category === 1 ? "bold" : "normal"}}>Work</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => clickTab(2)}>
          <Text style={{...styles.buttonText, color: category === 2 ? theme.darkgrey : theme.lightmint, fontWeight: category === 2 ? "bold" : "normal"}}>Study</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => clickTab(3)}>
          <Text style={{...styles.buttonText, color: category === 3 ? theme.darkgrey : theme.lightmint, fontWeight: category === 3 ? "bold" : "normal"}}>Family</Text>
        </TouchableOpacity>
      </View>
      <View>
        <TextInput style={styles.input} placeholder="Add a To Do" onChangeText={onChangeText} onSubmitEditing={addToDo} value={text} />
      </View>
      <ScrollView>
        {Object.keys(toDos).map((key) => 
          toDos[key].category === category ? (
            <View style={styles.toDo} key={key}>
              <View flexDirection="row" alignItems="center">
                <TouchableOpacity onPress={() => toggleToDo(key)}>
                  <Fontisto name={toDos[key].done === true ? "checkbox-active" : "checkbox-passive"} size={SCREEN_WIDTH/20} color={toDos[key].done === true ? theme.lightgrey : theme.darkgrey} />
                </TouchableOpacity>
                {
                  toDos[key].edit === true ?
                  <TextInput style={styles.editText} placeholder={toDos[key].text} onChangeText={onChangeEdit} onSubmitEditing={() => editToDo(key)} />
                  : 
                  <Text style={toDos[key].done === true ? styles.checkedText : styles.toDoText}>{toDos[key].text}</Text>
                }
              </View>
              <View flexDirection="row" alignItems="center" style={toDos[key].edit === true ? styles.editing : styles.editor }>
                {toDos[key].edit === true ?
                  <View flexDirection="row" alignItems="center">
                    <TouchableOpacity onPress={() => editToDo(key)}>
                      <FontAwesome5 name="check" size={SCREEN_WIDTH/15} color={theme.lightgrey} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => editClick(key)}>
                      <Entypo name="cross" size={SCREEN_WIDTH/10} color={theme.lightgrey} />
                    </TouchableOpacity>
                  </View>
                  :
                  <TouchableOpacity onPress={() => editClick(key)}>                  
                    <FontAwesome5 name="pen" size={SCREEN_WIDTH/20} color={theme.lightgrey} />
                  </TouchableOpacity>
                }
                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <Fontisto name="trash" size={SCREEN_WIDTH/18} color={theme.lightgrey} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.deleteAllButton} onPress={deleteAll}>
          <Text style={styles.deleteAllText}>Delete All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.mint,
    paddingHorizontal: 20
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: SCREEN_HEIGHT/10
  },
  buttonText: {
    fontSize: SCREEN_WIDTH/12,
    paddingHorizontal: 5
  },
  input: {
    backgroundColor: theme.white,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginVertical: 20,
    fontSize: SCREEN_WIDTH/20
  },
  toDo: {
    backgroundColor: theme.lightmint,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  checkedText: {
    color: theme.lightgrey,
    fontSize: SCREEN_WIDTH/20,
    textDecorationLine: "line-through",
    paddingHorizontal: 10
  },
  toDoText: {
    color: theme.darkgrey,
    fontSize: SCREEN_WIDTH/20,
    paddingHorizontal: 10
  },
  editText: {
    backgroundColor: theme.white,
    fontSize: SCREEN_WIDTH/20,
    marginVertical: -3,
    marginLeft: 10,
    paddingHorizontal: 15,
    width: SCREEN_WIDTH/2.5,
    height: 30,
    borderRadius: 15
  },
  editor: {
    width: SCREEN_WIDTH/7,
    justifyContent: "space-between"
  },
  editing: {
    marginVertical: -10
  },
  footer: {
    marginVertical: 20,
    paddingHorizontal: 5,
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  deleteAllButton: {
    backgroundColor: theme.darkgrey,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 15
  },
  deleteAllText: {
    color: theme.white
  }
});
