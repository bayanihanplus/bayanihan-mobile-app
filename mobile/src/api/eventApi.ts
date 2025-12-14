import api from "./api";

export const fetchEvents = () => api.get("/events");

export const createEvent = (formData: FormData) => {

  return api
            .post("/events",formData,{
              headers: { "Content-Type": "multipart/form-data"}
            })
            .then((res) =>{
              console.log("Event created successfully",res.data);
              return res.data; // ✅ return actual data
            })
            .catch((error)=>{
              console.log("Error: Failed to create event",error);
              throw error;
            });
};

export const addComment = (eventId: string, text: string) =>
  api.post(`/events/${eventId}/comments`, { text });
