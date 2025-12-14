import React, { useState } from "react";
import { Modal, View, TextInput, Text, Button, TouchableOpacity, Image, StyleSheet,Platform  } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { useAuthContext } from "./AuthContext";
import { Picker } from '@react-native-picker/picker';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (item: { item_name: string; price: number; username: string; category: string; imageUri: string | null }) => void;
}

export default function AddItemModal({ visible, onClose, onSubmit }: AddItemModalProps) {
  const { user } = useAuthContext();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const categories = ["Fruit", "Vegetable", "Electronics", "Clothing","Others"]; // example categories
  
  const handleImagePick = async () => {
    const result = await launchImageLibrary({ mediaType: "photo", quality: 0.7 });
    if (!result.didCancel && result.assets && result.assets[0].uri) {
      setImageUri(result.assets[0].uri);
    }
  };
  const handleSubmit = () => {
    console.log("From Additem:",imageUri);
    onSubmit({
      item_name: itemName,
      price: Number(price),
      username : user.username,
      category,
      imageUri,
    });
    setItemName("");
    setPrice("");
    setCategory("");
    setImageUri(null);
  };
  
  return (  
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Add Item</Text>
          <TextInput style={styles.input} placeholder="Item Name" value={itemName} onChangeText={setItemName} />
          <TextInput style={styles.input} placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
          
          {/* Category Picker*/}
              <View style={styles.pickerContainer}>
              <Picker
                  selectedValue={category}
                  onValueChange={(val) => setCategory(val)}
                  mode="dropdown"
                  style={styles.picker}
                >
                  {categories.map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
                </Picker>
          </View>

          {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

          <TouchableOpacity style={styles.imageButton} onPress={handleImagePick}>
            <Text style={styles.imageButtonText}>Pick Image</Text>
          </TouchableOpacity>

          <View style={styles.actions}>
            <Button title="Add Draft" onPress={handleSubmit} />
            <Button title="Cancel" color="#aaa" onPress={onClose} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modal: { width: "85%", backgroundColor: "#fff", padding: 16, borderRadius: 12 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 8, marginBottom: 10 },
  preview: { width: "100%", height: 150, borderRadius: 8, marginBottom: 10 },
  imageButton: { backgroundColor: "#2196F3", padding: 10, borderRadius: 8, alignItems: "center", marginBottom: 10 },
  imageButtonText: { color: "#fff", fontWeight: "bold" },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  picker: Platform.OS === "ios" ? { height: 150 } : {},
  pickerContainer: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, marginBottom: 10, overflow: "hidden" },

});
