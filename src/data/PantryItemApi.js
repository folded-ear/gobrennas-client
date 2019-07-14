import Dispatcher from "./dispatcher"
import BaseAxios from 'axios'
import PantryItemActions from "./PantryItemActions"
import PantryItem from "../models/PantryItem"
import { API_BASE_URL } from "../constants/index"

const axios = BaseAxios.create({
    baseURL: `${API_BASE_URL}/api/pantryitem`,
})

const PantryItemApi = {
    fetchPantryItems() {
        axios.get('/all')
            .then( res => {
                Dispatcher.dispatch({
                    type: PantryItemActions.PANTRYITEMS_LOADED,
                    data: res.data
                })
            })
    },
    
    addPantryItem(item) {
        axios
            .post('/', item.toJSON())
            .then( response => {
                // TODO: Add error handling and logging
                if(response.status && response.status === 201) {
                    const { data: item} = response
                    
                    Dispatcher.dispatch({
                        type: PantryItemActions.PANTRYITEMS_ADDED,
                        data: new PantryItem({
                            id: item.id,
                            name: item.name,
                            aisle: item.aisle
                        })
                    })
                }
            })
    }
}

export default PantryItemApi