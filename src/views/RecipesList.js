import React from 'react'
import PropTypes from "prop-types"
import {
    List,
    Spin
} from "antd"
import RecipeListItem from "./RecipeListItem"
import loadObjectOf from "../util/loadObjectOf"
import { Recipe } from "../data/RecipeTypes"

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

RecipesList.propTypes = {
    libraryLO: loadObjectOf(PropTypes.arrayOf(Recipe)).isRequired
}

export default RecipesList