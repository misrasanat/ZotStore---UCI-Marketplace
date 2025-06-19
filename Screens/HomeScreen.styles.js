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
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 12,
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
        backgroundColor: '#f9f9f9',
        borderRadius: 10,
        padding: 10,
        minWidth: '45%',
    },
    imagePlaceholder: {
        height: 100,
        backgroundColor: '#ddd',
        borderRadius: 8,
        marginVertical: 8,
    },
    seller: {
        fontSize: 14,
        color: '#333',
    },
    price: {
        fontWeight: 'bold',
        fontSize: 16,
    },
})
export default styles;