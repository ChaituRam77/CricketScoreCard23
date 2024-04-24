// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  addDoc,
  Timestamp,
  WriteResult,
  query,
  where,
  getDocsFromCache,
} from "firebase/firestore";
// const firebaseConfig = {
//   apiKey: "AIzaSyCy22SFvFcB0dAevkEEU6kdj4BsuD6llaE",
//   authDomain: "cricketscore23-c6b8f.firebaseapp.com",
//   projectId: "cricketscore23-c6b8f",
//   storageBucket: "cricketscore23-c6b8f.appspot.com",
//   messagingSenderId: "1055907934943",
//   appId: "1:1055907934943:web:3fc28364f48a05f92eef6a",
// };

// const firebaseConfig = {
//   apiKey: "AIzaSyC7WYjE0fThgZ13yGD8WoknUvWe3zytdMY",
//   authDomain: "worldcup23-f23d4.firebaseapp.com",
//   projectId: "worldcup23-f23d4",
//   storageBucket: "worldcup23-f23d4.appspot.com",
//   messagingSenderId: "105906288827",
//   appId: "1:105906288827:web:0d3c064b2b50396087d19e",
//   measurementId: "G-KFF3GTFN37"
// };
const firebaseConfig = {
  apiKey: "AIzaSyBeuvi0VKp1KS5nrbwuLEM0Yda9VgmNZbs",
  authDomain: "ipl24-5fd5a.firebaseapp.com",
  projectId: "ipl24-5fd5a",
  storageBucket: "ipl24-5fd5a.appspot.com",
  messagingSenderId: "656914913257",
  appId: "1:656914913257:web:6394ff0eb16b5878d4dd78",
  measurementId: "G-5WDQ85VM6N"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export default db;

export async function getAllDocs() {
  console.log("getAllDocs() : ");
  try {
    const coll = collection(db, "ApiScoreCard");
    const docSnaps = await getDocs(coll);
    let docMap = new Map();
    docSnaps.docs.map((doc) => {
      docMap.set(doc.id, doc.data());
    });
    console.log(docMap);
    return docMap;
  } catch (error) {
    console.log("getAllDocs() error : " + error.message);
  }
}

export async function getDocNmsFromColl(collNm) {
  // console.log("getDocNmsFromCollection() : ");
  try {
    let docNms = [];
    const coll = collection(db, collNm);
    const docSnaps = await getDocs(coll);
    docSnaps.docs.map((doc) => {
      docNms.push(doc.id);
    });
    console.log(docNms);
    return docNms;
  } catch (error) {
    console.log("getDocNmsFromCollection() error : " + error.message);
  }
}
export async function getDataFromDoc(collectionNm, docNm) {
  try {
    const coll = collection(db, collectionNm);
    const docSnaps = await getDocs(coll);
    let docMap = new Map();
    docSnaps.docs.map((doc) => {
      if (doc.id == docNm) {
        docMap.set(doc.id, doc.data());
      }
    });
    let fieldMap = new Map(Object.entries(docMap.get(docNm)));
    return fieldMap;
  } catch (error) {
    console.log("getDataFromDoc("+collectionNm+" , "+ docNm+") Error : " + error.message);
  }
}

export async function checkDocExistsInColl(collectionNm, docNm) {
  try {
    let docExists = false;
    const coll = collection(db, collectionNm);
    const docSnaps = await getDocs(coll);
    docSnaps.docs.map((doc) => {
      if (doc.id == docNm) {
        docExists = true;
      }
    });
    return docExists;
  } catch (error) {
    console.log("checkDocExistsInColl() Error : " + error.message);
  }
}
export async function addDocifNotExists(collectionNm, docNm) {
  try {
    db.collection(collectionNm).doc(docNm).set({ foo: "bar" }, { merge: true });
  } catch (error) {
    console.log("addDocifNotExists() error : " + error.message);
  }
}
export async function getFieldDataFromDoc(collectionNm, docNm, fieldNm) {
  // console.log("getFieldDataFromDoc() : ");
  try {
    const colRef = collection(db, collectionNm);
    const docSnaps = await getDocs(colRef);
    let docMap = new Map();
    docSnaps.docs.map((doc) => {
      if (doc.id == docNm) {
        docMap.set(doc.id, doc.data());
      }
    });
    let fieldMap = new Map(Object.entries(docMap.get(docNm)));
    // console.log("getFieldDataFromDoc() docMap - "+docMap.get(docNm));
    // console.log("getFieldDataFromDoc() fieldMap - "+fieldMap.get(fieldNm));
    return fieldMap.get(fieldNm);
  } catch (error) {
    console.log("getFieldDataFromDoc() error : " + error.message);
  }
}

export async function deleteOwnerDocs() {
  let ownerTeamsMap = new Map(
    Object.entries((await getAllDocs()).get("teams"))
  );
  let owners = ownerTeamsMap.get("Names");
  for (let i = 0; i < owners.length; i++) {
    let ownerName = owners[i];
    const ownerScoresdocRef = doc(db, "Owners", ownerName);
    await deleteDoc(ownerScoresdocRef);
    await setDoc(ownerScoresdocRef, {
      "1total": 0,
    }).catch((err) => {
      console.log(err.message);
    });
  }
  console.log("Deleted");
}
export async function deleteValueFromDoc(collNm, docNm, fieldNm) {
  console.log("deleteValueFromDoc");
  try {
    const ownerScoresdocRef = doc(db, collNm, docNm);
    await updateDoc(ownerScoresdocRef, {
      [fieldNm]: deleteField(),
    });
    console.log(
      "Deleted field " +
        fieldNm +
        " from doc " +
        docNm +
        " of collectioin " +
        collNm +
        " !!! "
    );
  } catch (error) {
    console.log(
      "Error : deleteValueFromDoc(" +
        collNm +
        " , " +
        docNm +
        " , " +
        fieldNm +
        ") : " +
        error
    );
  }
}

export async function deleteDocFromCollection(collNm, docNm) {
  console.log("deleteDocFromCollection");
  try {
    await deleteDoc(doc(db, collNm, docNm));
    console.log(
      "Deleted doc " + docNm + " from collectioin " + collNm + " !!! "
    );
  } catch (error) {
    console.log(
      "deleteDocFromCollection(" + collNm + " , " + docNm + ") : " + error
    );
  }
}

export async function deleteMatchScoreOfOwners(matchToDelete) {
  console.log("deleteMatchScore");
  let ownerMap = await getFieldDataFromDoc("teams", "Names");
  for (let i = 0; i < ownerMap.length; i++) {
    let ownerName = ownerMap[i];
    const ownerScoresdocRef = doc(db, "Owners", ownerName);
    await updateDoc(ownerScoresdocRef, {
      [matchToDelete]: deleteField(),
    });
  }
}
export async function addFieldToDB(
  collectionNm,
  documentNm,
  fieldNm,
  fieldObj
) {
  try {
  // console.log("fieldNm : " + fieldNm + " fieldObj " + JSON.stringify(fieldObj));
  const docRef = doc(db, collectionNm, documentNm);
  // const obj = Object.fromEntries(fieldObj);
  await setDoc(
    docRef,
    {
      [fieldNm]: fieldObj,
    },
    { merge: true }
  ).then(() => {
    console.log('Document successfully updated with the new map field');
  }).catch((err) => {
    console.log("error: " + err.message);
  }); } catch (error) {
    console.log("addFieldToDB() error : " + error.message);
  }
}

export async function addMapFieldToDoc(
  collectionNm,
  documentNm,
  fieldNm,
  fieldObjMap
) {
  try {
    console.log("addMapFieldToDoc")
  const docRef = doc(db, collectionNm, documentNm);
  // const obj = Object.fromEntries(fieldObj);
  const obj = Object.fromEntries(fieldObjMap);

  await setDoc(
    docRef,
    {
      [fieldNm]: fieldObjMap,
    },
    { merge: true }
  ).catch((err) => {
    console.log("error: " + err.message);
  });

  } catch (error) {
    console.log("addMapFieldToDoc() error: " + error.message);
  }
  
}

export async function addMapFieldToDB(collectionNm, documentNm, fieldObj) {
  const docRef = doc(db, collectionNm, documentNm);
  // docRef.set(fieldObj)
  const obj = Object.fromEntries(fieldObj);
  await setDoc(docRef, obj).catch((err) => {
    console.log("error: " + err.message);
  });
}

export async function updateFieldToDB(
  collectionNm,
  documentNm,
  fieldNm,
  fieldObj
) {
  try {
    debugPoint("Update")
  const docRef = doc(db, collectionNm, documentNm);
  // const obj = Object.fromEntries(fieldObj);
  await updateDoc(
    docRef,
    {
      [fieldNm]: fieldObj,
    },
    { merge: true }
  ).then(() => {
    console.log('Document successfully updated with the new map field');
  }).catch((err) => {
    console.log(
      "updateFieldToDB(" +
        collectionNm +
        "," +
        documentNm +
        "," +
        fieldNm +
        "," +
        fieldObj +
        ") error: " +
        err.message
    );
  });
  } catch (error) {
    console.log(
      "updateFieldToDB(" +
        collectionNm +
        "," +
        documentNm +
        "," +
        fieldNm +
        "," +
        fieldObj +
        ") error: " +
        error.message
    );
  }
  
}

export async function addDocToCollection(
  collectionNm,
  documentNm,
  fieldNm,
  fieldObj
) {
  const docRef = doc(db, collectionNm, documentNm);
  // const obj = Object.fromEntries(fieldObj);
  await setDoc(docRef, {
    [fieldNm]: fieldObj,
  }).catch((err) => {
    console.log("error: " + err.message);
  });
}

export async function setDocToCollection(
  collectionNm,
  documentNm,
  fieldNm,
  fieldObj
) {
  try {
    debugPoint("set")
    console.log(new Date().toLocaleString()+" : Inside setDocToCollection() colNm : "+collectionNm+" documentNm : "+documentNm
  // +" fieldNm : "+fieldNm
  +" fieldObj : "+fieldObj)
  const docRef = doc(db, collectionNm, documentNm);
  // const obj = Object.fromEntries(fieldObj);
  await setDoc(
    docRef,
    {
      [fieldNm]: fieldObj,
    },
    { merge: true }
  ).catch((err) => {
    console.log(" setDocToCollection() error: " + err.message);
  });
  } catch (error) {
    console.log(" setDocToCollection() catch error: " + error.message);
    
  }
  
}

export async function updateDocToCollection(
  collectionNm,
  documentNm,
  fieldNm,
  fieldObj
) {
  const docRef = doc(db, collectionNm, documentNm);
  // const obj = Object.fromEntries(fieldObj);
  await updateDoc(docRef, {
    [fieldNm]: fieldObj,
  }).catch((err) => {
    console.log("error: " + err.message);
  });
}

export function debugPoint(msg) {
  if(msg.includes("run out")){
     console.log("Debug point from " + msg);
  }
}
export function newdebugPoint(msg) {
  // if(msg.includes("run out")){
     console.log("Debug point from " + msg);
  // }
}

export function debugPoint0(msg) {
     console.log("Debug point from " + msg);
}

export function debugPoint1(msg) {
  console.log("Debug point from " + msg);
}
