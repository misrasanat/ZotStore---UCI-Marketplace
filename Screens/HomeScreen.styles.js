import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    fullScreen: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        padding: 16,
        backgroundColor: '#fff',
    },
    flexList: {
        flex: 1,
    },
    searchBar: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderColor: '#FFFF00',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 12,
        marginTop: 9,
    },
    sellButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
    },
    sellButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    listingsHeader: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    listingsContainer: {
        paddingBottom: 32,
        flexGrow: 1,
    },
    card: {
        flex: 1,
        margin: 8,
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        borderColor: '#0000FF',
        borderWidth: 1.2,
        padding: 10,
        minWidth: '45%',
    },
    imagePlaceholder: {
        height: 100,
        backgroundColor: '#ddd',
        borderRadius: 8,
        borderColor: '#FFFF00',
        borderWidth: 0.5,
        marginVertical: 8,
    },
    seller: {
        fontSize: 14,
        color: '#333',
        alignContent: 'center',
    },
    price: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    noListings: {
        textAlign: 'center',
        marginTop: 40,
        fontSize: 36,
        color: '#FFD000',
    },
})
export default styles;