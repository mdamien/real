Thumb = React.createClass({
  render: function(){
    var href="index.html#lvl:"+this.props.name;
    return (<li>
          <a href={href}>{this.props.name}</a>
        </li>)
  }
})

Thumbs = React.createClass({
  render: function(){
    var thumbs = [];
    for(lvl_name in this.props.levels){
      thumbs.push(<Thumb key={lvl_name} name={lvl_name} lvl={this.props.levels[lvl_name]} />)
    }
    return <div><strong>Examples:</strong><ul>{thumbs}</ul></div>;
  }
})

React.render(<Thumbs levels={LEVELS} />, document.getElementById('levels'))
