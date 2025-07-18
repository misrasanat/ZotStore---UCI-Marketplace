import {StyleSheet} from 'react-native';


const styles = StyleSheet.create({
    safeContainer: {
        backgroundColor: '#fff',
    },
    safeContainer2: {
        backgroundColor: '#0C2340',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container2: {
        paddingHorizontal: 16,
        paddingBottom: 0,
        paddingTop: 0,
        flex: 1,
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
        backgroundColor: '#fff', // soft gold vibe — tweak if you want it richer
        paddingHorizontal: 16,
        paddingTop: 3,
        paddingBottom: 0,
    },
    divider: {
        height: 1,
        backgroundColor: '#bbb', // Slightly bolder for contrast
        width: '100%',
        alignSelf: 'center',
    },
    searchBar: {
        flex: 1,
        height: 44,
        fontSize: 16,
        fontFamily: 'Inter-Medium',
        color: '#222',
        borderRadius: 22,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 22,
        paddingHorizontal: 12,
        marginBottom: 12,
        marginTop: 5,
        borderColor: '#0C2340',
        borderWidth: 0.20,
        elevation: 2,
    },

    searchIcon: {
        marginRight: 8,
    },
    sellButton: {
        backgroundColor: '#0C2340',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 12,
    },
    sellButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        paddingHorizontal: '15%',
        
    },
    listingsHeader: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        color: '#0C2340',              // deeper gray, softer contrast
        letterSpacing: 0.3,         // gives a tighter, confident look
        textTransform: 'uppercase', // optional: gives it a label-like vibe
    },
    listingsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16, // match your usual spacing
        paddingTop: 4,
        marginBottom: 12,
    },
    listingsContainer: {
        paddingBottom: '10%',
        flexGrow: 1,
    },
    card: {
        flex: 1,
        margin: 8,
        backgroundColor: '000',
        borderRadius: 10,
        paddingHorizontal: 8,
        paddingBottom: 14,
        paddingTop: 10,             //  consistent top spacing
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
        height: 50,
        backgroundColor: '#0C2340',
        borderTopWidth: 1,
        borderTopColor: '#10253dff',
        
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