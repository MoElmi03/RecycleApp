import { doc, increment, updateDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

export async function awardPoints(points:number){

const uid = auth.currentUser?.uid
if(!uid) return

const ref = doc(db,"users",uid)

await updateDoc(ref,{
points: increment(points),
weeklyPoints: increment(points)
})

}