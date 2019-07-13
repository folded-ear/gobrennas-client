import React from 'react'
import {
    List,
    Spin
} from "antd"
import RecipeListItem from "./RecipeListItem"

const RecipesList = (props: {}) => {
    const {libraryLO} = props
    
    if (!libraryLO.hasValue()) {
        return <Spin tip="Loading recipe library..."/>
    }
    
    const library = libraryLO.getValueEnforcing()
    return (
        <div className="recipes-list">
            <h1>Recipe Library</h1>
            <List
                dataSource={library}
                itemLayout="horizontal"
                renderItem={recipe => <RecipeListItem recipe={recipe}/>}
            />
                
            {library.length === 0  && <em>No recipes yet...</em>}
        </div>
    )
}

export default RecipesList