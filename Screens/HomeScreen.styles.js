import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container2: {
        padding: 16,
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
    topSection: {
        backgroundColor: '#fffff0', // soft gold vibe — tweak if you want it richer
        padding: 16,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 3,
    },
    searchBar: {
        height: 44,
        borderRadius: 22,                // pill shape
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        marginBottom: 12,
        marginTop: 9,

        borderColor: '#e4dba4',
        borderWidth: 1,

        // iOS shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,

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
        paddingBottom: '60%',
        flexGrow: 1,
    },
    card: {
        flex: 1,
        margin: 8,
        backgroundColor: '000',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingBottom: 14,
        paddingTop: 20,             //  consistent top spacing
        minWidth: '45%',
        justifyContent: 'flex-start', //  ensure top alignment
        // shadowColor: '000',
        // shadowOffset: { width: 0, height: 1 },
        // shadowOpacity: 0.08,
        // shadowRadius: 4,
        // elevation: 2,
        // borderWidth: 0,
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
    imagePlaceholder: {
        height: 180,
        backgroundColor: '#f8f8ff',
        borderRadius: 10,
        marginBottom: 10,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        color: '#999',
        fontSize: 30,
        fontWeight: 'Bold',
        textAlign: 'center',
        opacity: 0.8,
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
        color: '#2e8b57', // soft green — try '#28a745' for something more vibrant
        fontFamily: 'Inter-SemiBold',
        marginTop: 4,
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
    name: {
        fontWeight: '600',
        fontSize: 20,
        color: '#222',
        fontFamily: 'Inter-Medium',
        letterSpacing: 0.3,
        marginTop: 2,
    },
    navBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 60,
        backgroundColor: '#fdfff5',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 10, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    navText: {
        fontSize: 26,
        color: '#444',
        fontWeight: '600',
        textAlign: 'center',
    },
    

})
export default styles;