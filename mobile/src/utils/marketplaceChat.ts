import { API_BASE_URL } from "../api/api"
import { useAuthContext } from "../context/AuthContext";

const sendMessageNotification = async (sellerId: number,sellerName:string) => {
    const {token,user} = useAuthContext();
    try {
        await fetch(`${API_BASE_URL}/chats/${sellerId}`,{

            method: "POST",
            headers: {
                "Content-Type": "application/json",
                 Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message: "New chat started" }), // pwede mo palitan default msg     
            
        });
    } catch (error) {
        console.error("Failed to send chat nofitication",error);
    }
}