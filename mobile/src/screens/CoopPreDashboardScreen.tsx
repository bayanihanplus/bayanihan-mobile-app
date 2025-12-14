import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  FlatList,
  Dimensions,
  Animated,
  Modal,
  ImageBackground,
  TouchableWithoutFeedback,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ProtectedRoute } from "../context/ProtectedRoute";
import { resetStep } from "../utils/stepStorage";
import { useNavigation,RouteProp,useRoute } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { saveFinalDataToDatabase } from "../utils/items";
import { useAuthContext } from "../context/AuthContext";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MiniSplash from "../components/MiniSplash"; // adjust path
import { Section, Poster, addPoster } from "../utils/posterUtils";
type RootStackParamList = {

  Events : undefined;
  OnboardingHub : undefined;
  IdentityVerification : undefined;
  Verification : undefined;
  Orientation : undefined;
  Application : undefined;
  FinalReview : undefined;
  ApplicationReviewPending : undefined;
  Approval : undefined;
  CoopPreDashboard : undefined;
  CoopDashboard : undefined;
  Social : undefined;
  Savings : undefined;
  viewmembers : undefined;
  viewportal : undefined;
  AddSavings : undefined;
  Loan : undefined;
  Performance : undefined;
  Announcement : undefined;
  GovEvents : undefined;
  [key: string]: undefined; // ✅ allow dynamic screen names
};

type CoopPreDashboardRouteProp = RouteProp<RootStackParamList,"CoopPreDashboard">;
const SCREEN_WIDTH = Dimensions.get("window").width;

export default function CoopDashboard() {

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<CoopPreDashboardRouteProp>();
  const { progressData } = route.params || {};
  const [currentStep, setCurrentStep] = useState<string>("CoopPreDashboard"); 
  const [activeTab, setActiveTab] = useState<number | null>(1);
  const [activeMenu, setActiveMenu] = useState("Home");
  const [modalVisible, setModalVisible] = useState(false);
  const { token, user } = useAuthContext();
  const [miniSplash, setMiniSplash] = useState(false);

  // Animated height and opacity for each tab
  const animatedHeights = useRef([
    new Animated.Value(activeTab === 1 ? 50 : 0),
    new Animated.Value(activeTab === 2 ? 50 : 0),
    new Animated.Value(activeTab === 3 ? 50 : 0),
  ]).current;

  const animatedOpacities = useRef([
    new Animated.Value(activeTab === 1 ? 1 : 0),
    new Animated.Value(activeTab === 2 ? 1 : 0),
    new Animated.Value(activeTab === 3 ? 1 : 0),
  ]).current;

  const toggleTab = (tab: number) => {
    setActiveTab(prev => (prev === tab ? null : tab));

    animatedHeights.forEach((anim, index) => {
      const isActive = index === tab - 1;
      Animated.timing(anim, {
        toValue: activeTab === tab ? 0 : isActive ? 50 : 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });

    animatedOpacities.forEach((anim, index) => {
      const isActive = index === tab - 1;
      Animated.timing(anim, {
        toValue: activeTab === tab ? 0 : isActive ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    });
  };
  
  // Show modal automatically when screen opens
  useEffect(() => {
    setModalVisible(true);
  }, []);


  const handleContinue = async () => {
        try {
          if (!user?.id) {
            Toast.show({
              type: "error",
              text1: "Missing user info",
              text2: "Please log in again.",
            });
            return;
          }

          const payload = {
            userId: user.id,
            stepData: "AllStepsDone",
          };
          
          const result = await saveFinalDataToDatabase(payload, token);

          setModalVisible(false);
        } catch (error) {
          console.warn("[ERROR] Failed to save or reset:", error);
          Toast.show({
            type: "error",
            text1: "Oops!",
            text2: "Something went wrong. Please try again.",
            position: "top",
            visibilityTime: 3000,
          });
        }   
      };

  const quickActions = [
    { icon: "account-group-outline", label: "Members", type: "MaterialCommunityIcons", screen: "viewmembers" },
    { icon: "hand-coin-outline", label: "Add Savings", type: "MaterialCommunityIcons", screen: "AddSavings" },
    { icon: "briefcase-outline", label: "Loans", type: "Ionicons", screen: "Loan" },
    { icon: "chart-line", label: "Performance", type: "FontAwesome5", screen: "Performance" },
    { icon: "bullhorn-outline", label: "Announcements", type: "MaterialCommunityIcons", screen: "Announcement" },
    { icon: "calendar-outline", label: "Events", type: "Ionicons", screen: "GovEvents" },
  ];

  
  const banners = [
    { id: 1, image: require("../../assets/coopimages/feature1.jpg") },
    { id: 2, image: require("../../assets/coopimages/feature2.jpg") },
    { id: 3, image: require("../../assets/coopimages/feature3.jpg") },
    { id: 4, image: require("../../assets/coopimages/feature1.jpg") },
    { id: 5, image: require("../../assets/coopimages/feature2.jpg") },
  ];
  const exploreCards = [
    { icon: "star", label: "Marketplace Deals" },
    { icon: "rocket", label: "Financial Literacy Hub" },
    { icon: "gift", label: "Government Service Portal" },
    { icon: "trophy", label: "Career & Skills Development" },
    { icon: "heart", label: "Health & Wellness" },
  ];
  const [sections, setSections] = useState<Section[]>([
    {
      title: "Check this out",
      posters: [
        { id: 1, image: require("../../assets/coopimages/socialpost.jpg") },
        { id: 2, image: require("../../assets/coopimages/market.jpg") },
      ],
    },
    {
      title: "Just for you",
      posters: [
        { id: 3, image: require("../../assets/coopimages/market.jpg") },
        { id: 4, image: require("../../assets/coopimages/socialpost.jpg") },
      ],
    },
  ]);
  const bottomMenu = [
    { icon: "home-outline", label: "Feed", screen : "Social"},
    { icon: "storefront-outline", label: "Services", },
    { icon: "calendar-outline", label: "Gov.",},
    { icon: "swap-horizontal-outline", label: "Transactions", },
    { icon: "person-outline", label: "Account", screen : "Account"},
  ];

  return (
    <ProtectedRoute>
        <View style={styles.container}>
          <Modal
              animationType="fade"
              transparent={true}
              visible={modalVisible}
              onRequestClose={handleContinue}
            >
              <TouchableWithoutFeedback onPress={handleContinue}>
                <View style={styles.modalWrapper}>
                  
                  <View style={styles.popupBox}>
                    <Image
                      source={require("../../assets/bgforbayanihancoop.jpg")}
                      style={styles.popupImage}
                      resizeMode="cover"
                    />
                    <View style={styles.popupContent}>
                      <Text style={styles.addSavingsText1}>Remind me Later</Text>
                    </View>
                  </View>

                </View>
              </TouchableWithoutFeedback>
            </Modal>
          <LinearGradient
              colors={["#b91c1c", "#f87171"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.stickyHeader}
            >
                <View style={styles.headerLeft}>
                  <Image
                    source={require("../../assets/bayanihanLogo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                  <Text style={styles.headerTitle}>Cooperative Hub</Text>
                </View>
                
                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    {/* Tab Buttons Row */}
                    <View style={styles.tabs}>
                      {[1, 2, 3].map((tab) => (
                        <TouchableOpacity
                          key={tab}
                          style={[styles.tab, activeTab === tab && styles.activeTab]}
                          onPress={() => toggleTab(tab)}
                        >
                          <Text style={activeTab === tab ? styles.activeTabText : styles.tabText}>
                            {tab === 1 ? "Current Savings" : tab === 2 ? "Cooperative Hub" : "Coop Portal"}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Tab Content Areas */}
                    {[1, 2, 3].map((tab) => (
                      <Animated.View
                        key={tab}
                        style={[styles.tabContent, { height: animatedHeights[tab - 1] }]}
                      >
                        {tab === 1 && (
                          <Animated.View
                            style={[styles.tab1Content, { opacity: animatedOpacities[tab - 1] }]}
                          >
                            <Text style={styles.tab1Text}>₱50,000</Text>
                            <TouchableOpacity
                              style={[styles.addSavingsButton, { backgroundColor: "#f87171" }]}
                              onPress={() => navigation.navigate("Savings")}
                            >
                              <MaterialCommunityIcons name="hand-coin-outline" size={20} color="#fff" />
                              <Text style={styles.addSavingsText}>Show Summary</Text>
                            </TouchableOpacity>
                          </Animated.View>
                        )}

                        {tab === 2 && (
                          <Animated.View
                            style={[styles.tab1Content, { opacity: animatedOpacities[tab - 1] }]}
                          >
                            <Text style={styles.tab1Text}>45 Members</Text>
                            <TouchableOpacity
                              style={[styles.addSavingsButton, { backgroundColor: "#f87171" }]}
                              onPress={() => navigation.navigate("viewmembers")}
                            >
                              <MaterialCommunityIcons name="hand-coin-outline" size={20} color="#fff" />
                              <Text style={styles.addSavingsText}>View Members</Text>
                            </TouchableOpacity>
                          </Animated.View>
                        )}

                        {tab === 3 && (
                          <Animated.View
                            style={[styles.tab1Content, { opacity: animatedOpacities[tab - 1] }]}
                          >
                            <Text style={styles.tab1Text}>5 Features</Text>
                            <TouchableOpacity
                              style={[styles.addSavingsButton, { backgroundColor: "#f87171" }]}
                              onPress={() => navigation.navigate("viewportal")}
                            >
                              <MaterialCommunityIcons name="hand-coin-outline" size={20} color="#fff" />
                              <Text style={styles.addSavingsText}>View Portal</Text>
                            </TouchableOpacity>
                          </Animated.View>
                        )}
                      </Animated.View>
                    ))}
                  </View>
          </LinearGradient>   
          {/* Scrollable Content */}
          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {/* Quick Actions */}
            
            <View style={styles.quickActions}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.actionCard}
                 /*  onPress={() => action.screen && navigation.navigate(action.screen as never)} */
                 onPress={ () => 
                      {
                        setMiniSplash(true);
                        setTimeout(()=>{
                          setMiniSplash(false);
                          navigation.navigate(action.screen as never);
                        },500);  
                      }
                 }
                >
                  <View style={styles.actionIcon}>
                    {action.type === "Ionicons" && <Ionicons name={action.icon as any} size={24} color="#b91c1c" />}
                    {action.type === "MaterialCommunityIcons" && <MaterialCommunityIcons name={action.icon as any} size={24} color="#b91c1c" />}
                    {action.type === "FontAwesome5" && <FontAwesome5 name={action.icon as any} size={20} color="#b91c1c" />}
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Banners */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Featured</Text>
              <FlatList
                horizontal
                data={banners}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                <View style={styles.bannerCard}>
                  <Image
                    source={item.image}
                    style={styles.bannerImage}
                    resizeMode="cover"
                    />
                  </View>
                )}
                showsHorizontalScrollIndicator={false}
              />
            </View>

            {/* Explore App */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Explore App</Text>
              <View style={styles.exploreGrid}>
                {exploreCards.map((card, idx) => (
                  <TouchableOpacity key={idx} style={styles.exploreCard}>
                    <View style={styles.exploreIcon}>
                      <FontAwesome5 name={card.icon as any} size={20} color="#b91c1c" />
                    </View>
                    <Text style={styles.exploreLabel} numberOfLines={2} ellipsizeMode="tail">{card.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Posters */}
               {sections.map((section, idx) => (
                <View style={styles.section} key={idx}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <FlatList
                    horizontal
                    data={section.posters}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <View style={styles.posterCard}>
                        <Image source={item.image} style={styles.posterImage} resizeMode="cover" />
                      </View>
                    )}
                    showsHorizontalScrollIndicator={false}
                  />
                </View>
              ))}
            <View style={{ height: 0 }} />
          </ScrollView>

          {/* Bottom Menu */}
          <View style={styles.bottomMenu}>
            {bottomMenu.map((menu, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.menuItem}
                onPress={() => {
                  setActiveMenu(menu.label); 
                  navigation.navigate(menu.screen as never);
                }}
              >
                <Ionicons
                  name={menu.icon as any}
                  size={24}
                  color={activeMenu === menu.label ? "#b91c1c" : "#9ca3af"}
                />
                <Text style={[styles.menuLabel, activeMenu === menu.label && { color: "#b91c1c" }]}>
                  {menu.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <MiniSplash visible={miniSplash} />
        </View>
  </ProtectedRoute>
  );
}

const CARD_WIDTH = SCREEN_WIDTH / 3 - 20;
const BANNER_WIDTH = SCREEN_WIDTH * 0.7;
const POSTER_WIDTH = SCREEN_WIDTH * 0.6;

const styles = StyleSheet.create({

title: { fontSize: 20, fontWeight: "bold" },
 posterImage: {
    width: "100%",
    height: "100%",
    borderRadius: 15,        // optional if overflow is set
  },
modalWrapper: {
  flex: 1,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
},

popupBox: {
  width: "85%",
  height: "70%",
  borderRadius: 20,
  overflow: "hidden",
  justifyContent: "center",
  alignItems: "center",
},

popupImage: {
  position: "absolute", // behind content
  width: "100%",
  height: "100%",
  borderRadius: 30,
},

popupContent: {
  padding: 20, // actual spacing inside popup
  justifyContent: "center",
  alignItems: "center",
  marginTop: 150
},
  container: { flex: 1, backgroundColor: "#fef2f2" },
  stickyHeader: { backgroundColor: "#b91c1c", paddingTop: 10, zIndex: 10 },
  headerLeft: { flexDirection: "row", alignItems: "center", marginBottom: 10, marginHorizontal: 15 },
  logo: { width: 100, height: 40, marginRight: 10 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },

  tab: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20 },
  activeTab: { backgroundColor: "#fff" },
  tabText: { color: "#fee2e2", fontWeight: "600" },
  activeTabText: { color: "#b91c1c", fontWeight: "700" },
  tabContentText: { fontSize: 20, fontWeight: "700", color: "#fff", textAlign: "center" },
  scrollContainer: { flex: 1 },

  tabsContainer: { width: "100%" },
  tabs: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
  tabWrapper: { flex: 1 },
  tabContent: { overflow: "hidden", paddingHorizontal: 5, alignItems: "stretch" },
  tab1Content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    width: "100%",
    alignSelf: "stretch",
    marginTop: 5,
  },
  tab1Text: { fontSize: 20, fontWeight: "700", color: "#fff", textAlign: "left" },
  addSavingsButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f87171",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  addSavingsText1: {
  marginTop: 480, // pull text up
  fontSize: 18,
  fontWeight: "semibold",
  color: "#fff",
},
  addSavingsText: { color: "#fff", fontWeight: "600", marginLeft: 6, fontSize: 12 },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 10,
    marginTop: 15,
  },
  actionCard: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 15,
    alignItems: "center",
    paddingVertical: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  actionIcon: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: { marginTop: 6, fontSize: 12, fontWeight: "600", textAlign: "center", color: "#374151" },
  section: { marginTop: 15 },
  sectionTitle: { marginLeft: 15, fontSize: 16, fontWeight: "700", color: "#b91c1c", marginBottom: 10 },
  bannerCard: {
    width: BANNER_WIDTH,
    height: 120,
    backgroundColor: "#f87171",
    borderRadius: 15,
    overflow: "hidden",
    marginHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  exploreGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginHorizontal: 10 },
  exploreCard: {
    width: CARD_WIDTH,
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  exploreIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
 exploreLabel: {
  fontSize: 12,
  fontWeight: "600",
  color: "#374151",
  textAlign: "center", // <-- center the text horizontally
  flexWrap: "wrap",        // allows wrapping
  width: 80,
},
  posterCard: {
    width: POSTER_WIDTH,
    height: 140,
    backgroundColor: "#f87171",
    borderRadius: 15,
    marginHorizontal: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  bottomMenu: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderTopColor: "#e5e7eb",
    borderTopWidth: 1,
  },
  menuItem: { alignItems: "center" },
  menuLabel: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
});

