import React, { useEffect, useState } from 'react';
import { View, Button, Image, StyleSheet, Text, Platform, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [permission, setPermission] = useState<boolean | null>(null);
  const [processing, setProcessing] = useState(false);

  // 🔐 Permisiuni
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        setPermission(status === 'granted');
      }
    })();
  }, []);

  // 📷 Selectare imagine
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 🎨 Aplicare filtru
  const applyFilter = async (type: string) => {
    if (!image) return;

    setProcessing(true);

    let actions: ImageManipulator.Action[] = [];

    if (type === 'rotate90') {
      actions.push({ rotate: 90 });
    }

    if (type === 'flipVertical') {
      actions.push({ flip: ImageManipulator.FlipType.Vertical });
    }

    if (type === 'resize') {
      actions.push({ resize: { width: 300 } });
    }

    try {
      const result = await ImageManipulator.manipulateAsync(
        image,
        actions,
        { compress: 1, format: ImageManipulator.SaveFormat.PNG }
      );

      setImage(result.uri);
    } catch (e) {
      console.error(e);
    }

    setProcessing(false);
  };

  if (permission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to media library.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Button title="Pick image" onPress={pickImage} />

      {image && (
        <>
          <Image source={{ uri: image }} style={styles.image} />

          {processing && <ActivityIndicator size="large" />}

          <View style={styles.buttons}>
            <Button title="Rotate 90°" onPress={() => applyFilter('rotate90')} />
            <Button title="Flip Vertical" onPress={() => applyFilter('flipVertical')} />
            <Button title="Resize (Width 300)" onPress={() => applyFilter('resize')} />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: 300,
    height: 300,
    marginVertical: 20,
    resizeMode: 'contain',
  },
  buttons: {
    width: '100%',
    gap: 10,
  },
});
