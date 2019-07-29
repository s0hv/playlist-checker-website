import React from "react";
import {DataTypeProvider} from "@devexpress/dx-react-grid";
import {PhotoSizeSelectLarge} from '@material-ui/icons'

export class Thumbnail extends React.PureComponent {
    constructor(props) {
        super(props);

        // 1. bind your functions in the constructor.
        this.mouseOver = this.mouseOver.bind(this);
        this.mouseOut = this.mouseOut.bind(this);
        this.onClick = this.onClick.bind(this);
        this.state = {
            hover: false,
            clicked: false,
            thumbnail: props.value,
            videoId: this.props.row.video_id
        };
    }

    // 2. bind it with fat arrows.
    mouseOver () {
        this.setState({hover: true});
    }

    mouseOut() {
        this.setState({hover: false});
    }

    onClick() {
        this.setState({ clicked: true });
        //window.open(`https://www.youtube.com/watch?v=${this.props.row.video_id}`);
    }

    render() {
        const { hover, thumbnail, clicked, videoId } = this.state;

        if (!hover) return <PhotoSizeSelectLarge onMouseOver={this.mouseOver}/>;

        if (clicked) return <iframe width="560" height="315"
                                    src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen />;
        return (
            <div className="thumbnail" onMouseOut={this.mouseOut}>
                <img src={thumbnail} alt="thumbnail" width="300" onClick={this.onClick}/>
            </div>
        )
    }
}

export const ThumbnailTypeProvider = props => (
    <DataTypeProvider
        formatterComponent={Thumbnail}
        {...props}
    />
);
