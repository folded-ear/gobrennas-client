import React, { Component } from 'react'
import RecipeForm from '../containers/RecipeForm'
import { Redirect } from 'react-router-dom'
import { Spin } from 'antd'

class RecipeEdit extends Component<{ recipeLO: any }> {
    render() {
        let {recipeLO} = this.props
        
        if (!recipeLO.hasValue()) {
            if (recipeLO.isLoading()) {
                return <Spin tip="Recipe is loading..."/>
            }
            return <Redirect to="/library"/>
        }
        
        return (
            <RecipeForm />
        )
    }
}

export default RecipeEdit