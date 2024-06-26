import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageBackground,
  StyleSheet,
  FlatList,
  Animated,
  Modal,
  Button,
  Pressable,
  ActivityIndicator,
  ToastAndroid,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { Dropdown } from "react-native-element-dropdown";
import { app } from "../../../firebaseConfig";
import { getFirestore } from "firebase/firestore";
import { collection, getDocs, setDoc, addDoc } from "firebase/firestore";
import { useFocusEffect } from "@react-navigation/native";
import ItemHint from "../../components/Search/ItemHint";
import { useNavigation } from "@react-navigation/native";
import TopCompany from "../../components/Home/TopCompany";
import CompaniesItem from "../../components/Home/CompanyItem";
import Ionicons from "@expo/vector-icons/Ionicons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import ResultSearchCompanies from "../../components/Search/ResultSearchCompanies";
import ResultSearchCompaniesStackNav from "../../components/Search/ResultSearchCompaniesStackNav";
import BottomSheet, { BottomSheetMethods } from "@devvie/bottom-sheet";
import AntDesign from "@expo/vector-icons/AntDesign";
import { MaterialIcons } from "@expo/vector-icons";
import ResultSearchAll from "../../components/Search/ResultSearchAll";
import ResultSearchJob from "../../components/Search/ResultSearchJob";
import ResultSearchJobStackNav from "../../components/Search/ResultSearchJobStackNav";
import LoadingOverlay from "../../components/LoadingOverlay";
import ResultSearchAllStackNav from "../../components/Search/ResultSearchAllStackNav";
const LocationData = [
  { label: "All locations", value: "" },
  { label: "Hồ Chí Minh", value: "Hồ Chí Minh" },
  { label: "Hà Nội", value: "Hà Nội" },
  { label: "Đà Nẵng", value: "Đã Nẵng" },
];
const SalaryData = [
  { label: "Tất cả", value: "1" },
  { label: "Dưới $300", value: "2" },
  { label: "$300-$500", value: "3" },
  { label: "$500-$700", value: "4" },
  { label: "Trên $700", value: "5" },
];
export default function Search() {
  //Ket noi voi firebase
  const [textLocation, setTextLocation] = useState("All locations");

  const db = getFirestore(app);
  //Tab khi hiển thị kết quả tìm kiểm theo All/Job/Company
  const Tab = createMaterialTopTabNavigator();
  const [loading, setLoading] = useState(false);

  // Noi dung tìm kiem trong search bar
  const [searchText, setSearchText] = useState("");
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [showHints, setShowHints] = useState(true);
  const [searchResult, setSearchResult] = useState([]);

  //Luu ket qua tim kim List
  const [searchResultJob, setSearchResultJob] = useState([]);
  const [searchResultCompany, setSearchResultCompany] = useState([]);

  const [showSearchResult, setShowSearchResult] = useState(false);
  const [init, setInit] = useState(true);
  const [filter, setFilter] = useState(false);
  const [status, setStatus] = React.useState(false);
  const [valueLocation, setValueLocation] = useState("");
  const [valueSalary, setValueSalary] = useState("");

  const [searchLocation, setSearchLocation] = useState("");
  const [isFocus, setIsFocus] = useState(false);
  useEffect(() => {
    if (init) {
      fetchDataHint();
      setShowHints(true);
      setInit(false);
      console.log("Init: " + init);
    }
  }, [init]);

  useEffect(() => {
    if (searchText.length >= 2) {
      fetchDataHint();
    } else {
      setFilteredCompanies([]);
    }
  }, [searchText]);

  const removeAccents = (str) => {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "");
  };
  const fetchDataHint = async () => {
    try {
      const companySnapshot = await getDocs(collection(db, "Company"));
      const companies = companySnapshot.docs.map((doc) => doc.data());
      const searchTextWithoutAccents = removeAccents(searchText.toLowerCase());
      const filtered = companies.filter((company) =>
        removeAccents(company.Name.toLowerCase()).includes(
          searchTextWithoutAccents
        )
      );
      setFilteredCompanies(filtered);
      setShowHints(true);
      setShowSearchResult(false);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    console.log("Init - hint: " + init);

    console.log("Fetch Hint" + showHints + "-" + showSearchResult);
  };

  const fetchSearchCompanyResult = async (nameText, valueLocation) => {
    setLoading(true); // Bắt đầu quá trình load
    try {
      setSearchText(nameText);
      const companySnapshot = await getDocs(collection(db, "Company"));
      const companies = companySnapshot.docs.map((doc) => doc.data());
      const searchTextWithoutAccents = removeAccents(nameText.toLowerCase());
      const searchLocationWithoutAccents = removeAccents(
        valueLocation.toLowerCase()
      );
      const searchResult = companies.filter((company) =>
        removeAccents(company.Name.toLowerCase()).includes(
          searchTextWithoutAccents
        )
      );
      const searchResultFinal = searchResult.filter((company) =>
        removeAccents(company.Location.toLowerCase()).includes(
          searchLocationWithoutAccents
        )
      );
      setSearchResultCompany(searchResultFinal);
      setShowHints(false);
      setShowSearchResult(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };
  const fetchSearchJobResult = async (nameText, valueLocation) => {
    try {
      setSearchText(nameText);
      const jobSnapshot = await getDocs(collection(db, "Jobs"));
      const jobs = jobSnapshot.docs.map((doc) => doc.data());
      const searchTextWithoutAccents = removeAccents(nameText.toLowerCase());
      const searchLocationWithoutAccents = removeAccents(
        valueLocation.toLowerCase()
      );

      // const searchResult = jobs.filter((job) => {
      //   const nameJobLower = removeAccents(job.NameJob.toLowerCase());
      //   const nameCompanyLower = removeAccents(job.NameCompany.toLowerCase());
      //   const locationJobLower = removeAccents(job.LocationJob.toLowerCase());

      //   return (
      //     (nameJobLower.includes(searchTextWithoutAccents) ||
      //       nameCompanyLower.includes(searchTextWithoutAccents)) &&
      //     locationJobLower.includes(searchLocationWithoutAccents)
      //   );
      // });
      const searchResult = jobs.filter((job) => {
        const nameJobLower = removeAccents(job.NameJob.toLowerCase());
        const nameCompanyLower = removeAccents(job.NameCompany.toLowerCase());
        const locationJobLower = removeAccents(job.LocationJob.toLowerCase());

        // Additional condition for Salary
        const salary = job.Salary || 0; // Default to 0 if Salary is not present
        let salaryInRange = true;
        console.log("Check Salary" + valueSalary);
        if (valueSalary === "2") {
          console.log("Check luong");
          salaryInRange = salary < 300;
        } else if (valueSalary === "3") {
          salaryInRange = salary >= 300 && salary < 500;
        } else if (valueSalary === "4") {
          salaryInRange = salary >= 500 && salary < 700;
        } else if (valueSalary === "5") {
          salaryInRange = salary >= 700;
        }
        return (
          (nameJobLower.includes(searchTextWithoutAccents) ||
            nameCompanyLower.includes(searchTextWithoutAccents)) &&
          locationJobLower.includes(searchLocationWithoutAccents) &&
          salaryInRange // Include salary condition
        );
      });

      setSearchResultJob(searchResult);
      setShowHints(false);
      setShowSearchResult(true);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleHintPress = (hint) => {
    // fetchSearchResultByName(hint.Name);
    fetchSearchCompanyResult(hint.Name, valueLocation);
    fetchSearchJobResult(hint.Name, valueLocation);

    console.log("Hint presss:" + showHints + "-" + showSearchResult);
  };
  const handleSearchIconPress = () => {
    // fetchSearchCompanyResultByFilter(searchText, valueLocation);
    if (searchText.length <= 0) {
      ToastAndroid.show(
        "Vui lòng nhập thông tin để tìm kiếm !",
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
    } else {
      console.log("Value salary: " + valueSalary);
      fetchSearchCompanyResult(searchText, valueLocation);
      fetchSearchJobResult(searchText, valueLocation);
    }
  };
  const navigation = useNavigation();

  //Cua so loc ke qua
  const slide = React.useRef(new Animated.Value(300)).current;

  const slideUp = () => {
    Animated.timing(slide, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  const slideDown = () => {
    Animated.timing(slide, {
      toValue: 500,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  React.useEffect(() => {
    slideUp();
  });

  const closeModal = () => {
    slideDown();

    setTimeout(() => {
      setStatus(false);
    }, 800);
  };
  const handleSaveChanges = () => {
    // fetchSearchCompanyResultByFilter(searchText, valueLocation);
    fetchSearchCompanyResult(searchText, valueLocation);
    fetchSearchJobResult(searchText, valueLocation);
    if (valueLocation == "") {
      setTextLocation("All locations");
    } else {
      setTextLocation(valueLocation);
    }
    closeModal();
  };
  const handleResetFilter = () => {
    setTextLocation("All locations");
    setValueLocation("");
    setValueSalary("");
  };

  return (
    <View className="bg-white" style={{ flex: 1, backgroundColor: "#fff" }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 40,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={32} color="#2c67f2" />
        </TouchableOpacity>
        <View
          style={{
            backgroundColor: "#F4F6F5",
            padding: 5,
            borderRadius: 16,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1.5,
            borderColor: "#2c67f2",
            width: 300,
            marginLeft: 8,
          }}
        >
          <TouchableOpacity onPress={handleSearchIconPress}>
            <Ionicons name="search" size={24} color="#2c67f2" />
          </TouchableOpacity>
          <TextInput
            placeholder="Search job, company, etc.."
            placeholderTextColor={"#171716"}
            style={{ marginLeft: 8, flex: 1, backgroundColor: "#F4F6F5" }}
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity onPress={() => setStatus(true)}>
            <Ionicons name="filter" size={24} color="#2c67f2" />
          </TouchableOpacity>
        </View>
      </View>
      {showHints && (
        <>
          <Text
            className="m-3 mt-5"
            style={{ color: "#2c67f2", fontWeight: "bold", fontSize: 15 }}
          >
            Gợi ý tìm kiếm
          </Text>
          <FlatList
            data={filteredCompanies}
            className=" bg-white  border-spacing-x-32 rounded-t "
            style={{ paddingLeft: 10, paddingRight: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                key={item.ID}
                onPress={() => handleHintPress(item)}
              >
                <ItemHint itemHint={item} />
              </TouchableOpacity>
            )}
            keyExtractor={(item) => item.ID}
          />
        </>
      )}
      {showSearchResult && (
        <>
          <Tab.Navigator
            style={{ flex: 1 }}
            screenOptions={{
              tabBarActiveTintColor: "#2c67f2",
            }}
          >
            {/* <Tab.Screen name="All" component={ResultSearchAll} /> */}

            {/* <Tab.Screen name="Job" component={ResultSearchJob} /> */}
            <Tab.Screen name="All">
              {() => (
                <ResultSearchAllStackNav
                  itemListJob={searchResultJob}
                  itemListCompany={searchResultCompany}
                  filterLocation={valueLocation}
                  textLocation={textLocation}
                />
              )}
            </Tab.Screen>
            <Tab.Screen name="Job">
              {() => (
                <ResultSearchJobStackNav
                  itemList={searchResultJob}
                  filterLocation={valueLocation}
                  textLocation={textLocation}
                />
              )}
            </Tab.Screen>
            <Tab.Screen name="Companies">
              {() => (
                <ResultSearchCompaniesStackNav
                  itemList={searchResultCompany}
                  filterLocation={valueLocation}
                  textLocation={textLocation}
                />
              )}
            </Tab.Screen>
          </Tab.Navigator>
        </>
      )}
      {status && (
        <Pressable onPress={closeModal} style={styles.backdrop}>
          <Pressable style={{ width: "100%", height: "55%" }}>
            <Animated.View
              style={[
                styles.bottomSheet,
                { transform: [{ translateY: slide }] },
              ]}
            >
              <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                Advance Filter
              </Text>
              <View style={{ marginTop: 20 }}>
                <Text
                  style={{ fontSize: 15, marginBottom: 10, color: "#b8b8b8" }}
                >
                  Location
                </Text>
                <Dropdown
                  style={[
                    styles.dropdown,
                    isFocus && { borderColor: "#2c67f2" },
                  ]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  iconStyle={styles.iconStyle}
                  data={LocationData}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={!isFocus ? "All location" : ""}
                  value={valueLocation}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={(item) => {
                    setValueLocation(item.value);
                    setIsFocus(false);
                  }}
                  renderLeftIcon={() => (
                    <AntDesign
                      style={styles.icon}
                      color={isFocus ? "#2c67f2" : "#8f8f8f"}
                      name="enviromento"
                      size={20}
                    />
                  )}
                />
                <Text
                  style={{ fontSize: 15, marginBottom: 10, color: "#b8b8b8" }}
                >
                  Salary
                </Text>

                <Dropdown
                  style={[
                    styles.dropdown,
                    isFocus && { borderColor: "#2c67f2" },
                  ]}
                  placeholderStyle={styles.placeholderStyle}
                  selectedTextStyle={styles.selectedTextStyle}
                  iconStyle={styles.iconStyle}
                  data={SalaryData}
                  maxHeight={300}
                  labelField="label"
                  valueField="value"
                  placeholder={!isFocus ? "Tất cả" : ""}
                  value={valueSalary}
                  onFocus={() => setIsFocus(true)}
                  onBlur={() => setIsFocus(false)}
                  onChange={(item) => {
                    setValueSalary(item.value);
                    setIsFocus(false);
                  }}
                  renderLeftIcon={() => (
                    <MaterialIcons
                      style={styles.icon}
                      color={isFocus ? "#2c67f2" : "#8f8f8f"}
                      name="attach-money"
                      size={20}
                    />
                  )}
                />

                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSaveChanges}
                >
                  <Text
                    style={{ fontSize: 18, fontWeight: "bold", color: "white" }}
                  >
                    SAVE CHANGES
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 30,
                    paddingVertical: 10,
                    borderRadius: 10,
                    backgroundColor: "white",
                    alignItems: "center",
                    marginTop: 15,
                    borderWidth: 1,
                    borderColor: "#b8b8b8",
                  }}
                  onPress={handleResetFilter}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      color: "#666666",
                    }}
                  >
                    RESET FILTER
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </Pressable>
        </Pressable>
      )}
      <LoadingOverlay loading={loading} />
    </View>
  );
}
const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    flex: 1,
    top: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    width: "100%",
    height: "100%",
    backgroundColor: "white",
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#bcbcbc",
    paddingHorizontal: 15,
    marginBottom: 10,
  },
  button: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#2c67f2",
    alignItems: "center",
    marginTop: 15,
  },
  dropdown: {
    height: 50,
    borderColor: "#b8b8b8",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
