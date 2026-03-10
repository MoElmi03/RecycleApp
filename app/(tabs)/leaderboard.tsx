import { useEffect, useState } from "react"
import { Animated, FlatList, StyleSheet, Text, View } from "react-native"
import Svg, { Path } from "react-native-svg"
import { getLeaderboard } from "../../lib/leaderboard"

export default function LeaderboardScreen() {

  const [users, setUsers] = useState<{ id: string; rank: number; name: string; level: number; weeklyPoints: number }[]>([])
  const scaleAnim = new Animated.Value(0.8)

  useEffect(() => {
    loadLeaderboard()

    Animated.spring(scaleAnim,{
      toValue:1,
      friction:4,
      useNativeDriver:true
    }).start()

  }, [])

  async function loadLeaderboard(){
    const data = await getLeaderboard()
    setUsers(data)
  }

  const top3 = users.slice(0,3)
  const rest = users.slice(3)

  return(
    <View style={styles.container}>

      <Sparkles/>

      <Text style={styles.title}>Leaderboard</Text>

      {/* PODIUM */}
      <View style={styles.podiumRow}>
        {top3.map((user,index)=>(
          <Animated.View
            key={user.id}
            style={[styles.podiumItem,{transform:[{scale:scaleAnim}]}]}
          >
            {index===0 && <Text style={styles.crown}>👑</Text>}
            <View style={styles.avatar}/>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.level}>level {user.level}</Text>
          </Animated.View>
        ))}
      </View>

      {/* RANK LIST */}
      <View style={styles.listBox}>
        <FlatList
          data={rest}
          keyExtractor={(item)=>item.id}
          renderItem={({item})=>(
            <View style={styles.row}>
              <Text>{item.rank}</Text>
              <Text style={styles.rowName}>{item.name}</Text>
              <Text>{item.weeklyPoints} pts</Text>
            </View>
          )}
        />
      </View>

    </View>
  )
}

function Sparkles(){
  return(
    <Svg width={211} height={232} viewBox="0 0 211 232" style={styles.sparkles}>
      <Path d="M101 104C101 104 103.207 124.6 111.804 133.196C120.4 141.793 141 144 141 144C141 144 120.4 146.207 111.804 154.804C103.207 163.4 101 184 101 184C101 184 98.793 163.4 90.1964 154.804C81.5997 146.207 61 144 61 144C61 144 81.5997 141.793 90.1964 133.196C98.793 124.6 101 104 101 104Z" fill="white" fillOpacity={0.35}/>
    </Svg>
  )
}

const styles = StyleSheet.create({

container:{
flex:1,
backgroundColor:"#6C7A3D",
paddingTop:60
},

title:{
color:"white",
fontSize:22,
fontWeight:"700",
textAlign:"center"
},

podiumRow:{
flexDirection:"row",
justifyContent:"space-evenly",
marginTop:40
},

podiumItem:{
alignItems:"center"
},

crown:{
fontSize:34,
position:"absolute",
top:-30
},

avatar:{
width:70,
height:70,
borderRadius:35,
backgroundColor:"#ccc"
},

name:{
color:"white",
fontWeight:"600",
marginTop:6
},

level:{
color:"#ddd",
fontSize:12
},

listBox:{
flex:1,
backgroundColor:"#F5F5F5",
marginTop:40,
borderTopLeftRadius:30,
borderTopRightRadius:30,
padding:20
},

row:{
flexDirection:"row",
justifyContent:"space-between",
paddingVertical:14
},

rowName:{
flex:1,
marginLeft:15
},

sparkles:{
position:"absolute",
top:0,
right:0
}

})