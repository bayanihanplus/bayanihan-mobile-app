// utils/uploadFile.ts
import { Platform } from "react-native";

export async function appendFileToFormData(
  formData: FormData,
  fieldName: string,
  file: {
    uri: string;
    name?: string;
    type?: string;
  }
) {
  if (Platform.OS === "web") {
    // On web, fetch the file as a Blob or use File directly
    const response = await fetch(file.uri);
    const blob = await response.blob();
    formData.append(fieldName, blob, file.name);
  } else {
    // On iOS/Android, React Native fetch supports {uri, name, type}
    formData.append(fieldName, {
      uri: file.uri,
      name: file.name || `upload.${file.type?.split("/")[1] || "jpg"}`,
      type: file.type || "application/octet-stream",
    } as unknown as Blob); // TypeScript workaround, safe for React Native fetch
  }
}