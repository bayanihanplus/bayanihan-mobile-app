import { API_BASE_URL,API_BASE_URL_MAIN } from "../api/api";
import { Item } from "../context/ItemCard";

export const fetchItems = async (token: string): Promise<Item[]> => {
  const res = await fetch(`${API_BASE_URL}/items`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  
    if (!data || !Array.isArray(data.items)) {
    console.warn("fetchItems: 'items' is missing in response", data);
    return [];
    }
    
    return data.items.map((item: any) => ({
    ...item,
    imageUri: item.image ? `${API_BASE_URL_MAIN}${item.image}`.replace(/\\/g, '/') : null,
    mode: "posted",
  }));
};

export const postItem = async (item: any, token: string) => {
  const formData = new FormData();
  formData.append("item_name", item.item_name);
  formData.append("price", item.price.toString());
  formData.append("category", item.category);
  if (item.imageUri) {
    formData.append("image", {
      uri: item.imageUri,
      name: `item_${Date.now()}.jpg`,
      type: "image/jpeg",
    } as any);
  }

  const res = await fetch(`${API_BASE_URL}/items/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  return await res.json();
};
export const saveFinalDataToDatabase = async (data: any, token?: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/items/save-final-data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });

    // ✅ Always check if request succeeded before reading response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error ${response.status}`);
    }

    const result = await response.json();
   /*  console.log("[DB] Data saved successfully:", result); */
    return result; // ✅ Returns a single object, not an array
  } catch (error) {
    console.warn("[DB] Error saving data:", error);
    throw error;
  }
};
