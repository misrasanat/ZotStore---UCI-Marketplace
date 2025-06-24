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
        borderWidth: 1,
        borderColor: '#fbf2c4',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 12,
        marginTop: 9,
        
        backgroundColor: '#fff', // needed for the shadow to show well

        // iOS shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,

        // Android elevation
        elevation: 2,
    },
    sellButton: {
        backgroundColor: '#194a7a',
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
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 12,
        color: '#444',              // deeper gray, softer contrast
        letterSpacing: 0.3,         // gives a tighter, confident look
        textTransform: 'uppercase', // optional: gives it a label-like vibe
        opacity: 0.85,
    },
    listingsContainer: {
        paddingBottom: 32,
        flexGrow: 1,
    },
    card: {
        flex: 1,
        margin: 8,
        backgroundColor: '#f8f8ff',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingBottom: 14,
        paddingTop: 20,             // 👈 consistent top spacing
        minWidth: '45%',
        justifyContent: 'flex-start', // 👈 ensure top alignment
        shadowColor: '#007AFF',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 0,
    },
    imagePlaceholder: {
        height: 100,
        backgroundColor: '#eee', // softer than #ddd
        borderRadius: 8,
        marginVertical: 8,
    },
    seller: {
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
        fontFamily: 'System',
        fontWeight: '700',
        marginBottom: 6,
    },
    price: {
        fontWeight: 'bold',
        fontSize: 16,
        flexWrap: 'wrap',
        paddingTop: 10,
        fontFamily: 'Inter-SemiBold', // or a custom one like 'Inter-SemiBold' or 'Roboto'
        letterSpacing: 0.3,
        color: '#1a1a1a',
    },
    noListings: {
        textAlign: 'center',
        marginTop: 60,
        fontSize: 20,
        color: '#888',                 // a soft, muted gray
        fontStyle: 'italic',
        letterSpacing: 0.5,
        opacity: 0.85,                 // subtle transparency
        fontWeight: '500',
    },
    cardImage: {
        height: 180,
        borderRadius: 10,
        marginBottom: 10,
        width: '100%',
    },
    cardTop: {
        height: 200,
    },

})
export default styles;