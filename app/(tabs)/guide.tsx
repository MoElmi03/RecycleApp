import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function GuideScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            placeholder="Search items"
            placeholderTextColor="#999"
            style={styles.searchInput}
          />
        </View>

        <TouchableOpacity style={styles.filterBtn}>
          <Feather name="sliders" size={20} color="#606C38" />
        </TouchableOpacity>
      </View>

      {/* Main White Panel */}
      <View style={styles.sheet}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Explore Categories Section */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Explore categories</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {/* Categories Grid */}
          <View style={styles.gridContainer}>
            {/* Plastic Items */}
            <TouchableOpacity style={styles.categoryCard}>
              <Image
                source={require('../../assets/images/plastic.png')} // add your image
                style={styles.categoryImage}
              />
              <Text style={styles.categoryName}>Plastic Items</Text>
            </TouchableOpacity>

            {/* Paper & Cardboard */}
            <TouchableOpacity style={styles.categoryCard}>
              <Image
                source={require('../../assets/images/paper.png')} // add your image
                style={styles.categoryImage}
              />
              <Text style={styles.categoryName}>Paper & Cardboard</Text>
            </TouchableOpacity>

            {/* Glass & Metal */}
            <TouchableOpacity style={styles.categoryCard}>
              <Image
                source={require('../../assets/images/glass.png')} // add your image
                style={styles.categoryImage}
              />
              <Text style={styles.categoryName}>Glass & Metal</Text>
            </TouchableOpacity>

            {/* Food & Organic Waste */}
            <TouchableOpacity style={styles.categoryCard}>
              <Image
                source={require('../../assets/images/organic.png')} // add your image
                style={styles.categoryImage}
              />
              <Text style={styles.categoryName}>Food & Organic Waste</Text>
            </TouchableOpacity>

            {/* Common Contaminants */}
            <TouchableOpacity style={styles.categoryCard}>
              <Image
                source={require('../../assets/images/contaminants.png')} // add your image
                style={styles.categoryImage}
              />
              <Text style={styles.categoryName}>Common Contaminants</Text>
            </TouchableOpacity>

            {/* Local Rules */}
            <TouchableOpacity style={styles.categoryCard}>
              <Image
                source={require('../../assets/images/rules.png')} // add your image
                style={styles.categoryImage}
              />
              <Text style={styles.categoryName}>Local Rules</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#606C38',
  },

  header: {
    paddingTop: 70,
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEFAE0',
    borderRadius: 25,
    paddingHorizontal: 16,
    height: 50,
  },

  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#283618',
  },

  filterBtn: {
    backgroundColor: '#FEFAE0',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  sheet: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },

  seeAll: {
    fontSize: 14,
    color: '#606C38',
    fontWeight: '600',
  },

  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },

  categoryCard: {
    width: '48%',
    backgroundColor: '#F8F8F8',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  categoryImage: {
    width: 100,
    height: 100,
    marginBottom: 12,
    resizeMode: 'contain',
  },

  categoryName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
  },
});