import React from 'react';

function RecipesList(props) {
  return <div>
    <section id="main">
      <ul>
        {[...props.recipes.values()].reverse().map(recipe => (
          <li key={recipe.id}>
            <div className="view">
              <label>{recipe.title}</label>
            </div>
          </li>
        ))}
      </ul>
    </section>
  </div>;
}

export default RecipesList;