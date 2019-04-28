import React, {Component} from 'react';

class Recipes extends Component {
  
  constructor(props) {
    super(props);
    this.state = {
      selected: 0
    }
  }
  
  selectRecipe(id) {
    this.setState({selected: id});
  }
  
  render() {
    const {selected} = this.state;
    
    return (
      <div>
        <h2>All Recipes</h2>
      </div>
    )
  }
}

export default Recipes;