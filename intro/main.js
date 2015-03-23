Thumb = React.createClass({
  render: function(){
    var href="index.html#lvl:"+this.props.lvl_name;
    return (<span className="thumb">
          <a href="{href}">{this.props.name}</a>
          <img src={this.props.lvl.bg.src} />
        </span>)
  }
})

Thumbs = React.createClass({
  render: function(){
    var thumbs = [];
    for(lvl_name in this.props.levels){
      thumbs.push(<Thumb key={lvl_name} name={lvl_name} lvl={this.props.levels[lvl_name]} />)
    }
    return <div>{thumbs}</div>;
  }
})

React.render(<Thumbs levels={LEVELS} />, document.getElementById('levels'))
