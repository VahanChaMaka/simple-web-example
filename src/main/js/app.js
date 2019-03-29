const React = require('react');
const ReactDOM = require('react-dom');
const client = require('./client');
const stompClient = require('./websocket-listener');

class App extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            employees: [],
            attributes: [],
            page: 0,
            size: 3,
            fullAmount: 0
        };
        this.onNavigate = this.onNavigate.bind(this);
        this.updatePageSize = this.updatePageSize.bind(this);
        this.onCreate = this.onCreate.bind(this);
        this.onDelete = this.onDelete.bind(this);
        this.onUpdate = this.onUpdate.bind(this);
        this.calculateLastPage = this.calculateLastPage.bind(this);
    }

    componentDidMount() {
        var params = {
            page: this.state.page,
            size: this.state.size
        };

        var module = this;
        client.sendRequest('getAll', params, {}, function(response){
            var response = JSON.parse(response.responseText);
            module.setState({
                employees: response.employees,
                fullAmount: response.fullAmount,
                attributes: response.attributes
            });
        });

        //register for receiving update notifications from server
        var module = this;
        stompClient.register([
            /*{route: '/spring/topic/newEmployee', callback: function () {
                module.onNavigate(module.calculateLastPage())
            }},
            {route: '/spring/topic/updateEmployee', callback: function () {
                module.onNavigate(module.state.page)
            }},
            {route: '/spring/topic/deleteEmployee', callback: function () {
                module.onNavigate(module.state.page);
            }}*/
            {route: '/spring/topic/update', callback: function (type) {
                module.onNavigate(module.state.page);
            }}
        ]);
    }

    onNavigate(page) {
        var params = {
            page: page,
            size: this.state.size
        };
        var module = this;
        client.sendRequest('getAll', params, {}, function(response){
            var response = JSON.parse(response.responseText);
            module.setState({
                employees: response.employees,
                fullAmount: response.fullAmount,
                page: page
            });
        });
    }

    updatePageSize(size){
        var params = {
            page: 0,
            size: size
        };
        var module = this;
        client.sendRequest('getAll', params, {}, function(response){
            var response = JSON.parse(response.responseText);
            module.setState({
                employees: response.employees,
                fullAmount: response.fullAmount,
                page: 0,
                size: size
            });
        });
    }

    onCreate(newEmployee) {
        var module = this;
        client.sendRequest('create', {}, newEmployee, function(response){
            module.onNavigate(lastPage);
        });
    }

    onDelete(id) {
        var params = {
            id: id,
            size: this.state.size
        };
        var module = this;
        client.sendRequest('delete', params, {}, function(response){
            var response = JSON.parse(response.responseText);
            module.setState({
                employees: response.employees,
                fullAmount: response.fullAmount,
                page: 0
            });
        });
    }

    onUpdate(employee) {
        var module = this;

        var onSuccess = function(response){
            module.onNavigate(module.state.page);
        };

        var onFail = function(response){
            if(response.status == 412) {
                window.alert("Your copy is outdated, table will be reloaded now.");
                module.onNavigate(module.state.page);
            }
        };

        client.sendRequest('update', {}, employee, onSuccess, onFail);
    }

    calculateLastPage() {
        var lastPage = Math.floor((this.state.fullAmount+1)/this.state.size);
        if((this.state.fullAmount+1) % this.state.size == 0){
            lastPage--;
        }
        return lastPage;
    }

    render() {
        return (
            <div>
                <CreateDialog attributes={this.state.attributes} onCreate={this.onCreate}/>
                <EmployeeList employees={this.state.employees} page={this.state.page}
                              size={this.state.size} fullAmount={this.state.fullAmount}
                              onNavigate={this.onNavigate} updatePageSize={this.updatePageSize}
                              onDelete={this.onDelete} onUpdate={this.onUpdate}
                              attributes={this.state.attributes}
                />
            </div>
        )
    }
}

class EmployeeList extends React.Component{

    constructor(props){
        super(props);
    }

    render() {
        var employees = this.props.employees.map(employee =>
            <Employee key={employee.id} employee={employee} onDelete={this.props.onDelete}
                      onUpdate={this.props.onUpdate} attributes={this.props.attributes}/>
        );

        var headers = Object.keys(this.props.attributes).map(attribute =>
            <th key={attribute}>{this.props.attributes[attribute]}</th>
        );
        headers.push(<th key="actions">Action</th>)

        return (
            <div className={"employeesWidget"}>
                <table>
                    <tbody>
                    <tr>
                        {headers}
                    </tr>
                    {employees}
                    </tbody>
                </table>
                <Pager onNavigate={this.props.onNavigate} updatePageSize={this.props.updatePageSize}
                       fullAmount={this.props.fullAmount} page={this.props.page} size={this.props.size}/>
            </div>
        )
    }
}

//button with tooltip and hover/press effects
class Button extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        return(
            <div className={"tooltip"}>
                <div className={"image-holder"}>
                    {this.props.button}
                </div>
                <span className="tooltiptext">{this.props.tooltiptext}</span>
            </div>
        )
    }
}

class Pager extends React.Component{

    constructor(props){
        super(props);
        this.handleNavFirst = this.handleNavFirst.bind(this);
        this.handleNavPrev = this.handleNavPrev.bind(this);
        this.handleNavNext = this.handleNavNext.bind(this);
        this.handleNavLast = this.handleNavLast.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }

    handleNavFirst(e){
        e.preventDefault();
        this.props.onNavigate(0);
    }

    handleNavPrev(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.page-1);
    }

    handleNavNext(e) {
        e.preventDefault();
        this.props.onNavigate(this.props.page+1);
    }

    handleNavLast(e) {
        e.preventDefault();
        this.props.onNavigate(Math.floor(this.props.fullAmount/this.props.size));
    }

    handleInput(e) {
        e.preventDefault();
        var pageSize = ReactDOM.findDOMNode(this.refs.pageSize).value;
        if (/^[0-9]+$/.test(pageSize)) {
            this.props.updatePageSize(pageSize);
        } else {
            ReactDOM.findDOMNode(this.refs.pageSize).value =
                pageSize.substring(0, pageSize.length - 1);
        }
    }

    render(){
        var disabled = false;
        disabled = this.props.page == 0;
        var leftButtons = [];
        leftButtons.push(<Button button={<button onClick={this.handleNavFirst} className={'singlePagerButton'} disabled={disabled}>&lt;&lt;</button>}
                                 key="First" tooltiptext="First"/>);
        leftButtons.push(<Button button={<button onClick={this.handleNavPrev} className={'singlePagerButton'} disabled={disabled}>&lt;</button>}
                                 key="Next" tooltiptext="Next"/>);

        disabled = this.props.fullAmount-this.props.size <= this.props.page*this.props.size
        var rightButtons = [];
        rightButtons.push(<Button button={<button onClick={this.handleNavNext} className={'singlePagerButton'} disabled={disabled}>&gt;</button>}
                                  key="Previous" tooltiptext="Previous"/>);
        rightButtons.push(<Button button={<button onClick={this.handleNavLast} className={'singlePagerButton'} disabled={disabled}>&gt;&gt;</button>}
                                  key="Last" tooltiptext="Last"/>);

        return (
            <div>
                <div className="pagerToolbar">{leftButtons}</div>
                <div className="pagerToolbar">
                    Page size:
                    <input ref="pageSize" defaultValue={this.props.size} onInput={this.handleInput} className={"pageSizeField pagerToolbar"}/>
                </div>
                <div className="pagerToolbar rightPagerButtons">{rightButtons}</div>
            </div>
        )
    }

    wrapButton(button, key){
        return <div className={"imageHolder"} key={key} style={{display: "inline"}}>{button}</div>;
    }
}

//single table row
class Employee extends React.Component{

    constructor(props){
        super(props);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleUpdate = this.handleUpdate.bind(this);
    }

    handleDelete() {
        this.props.onDelete(this.props.employee.id);
    }

    handleUpdate() {
        this.props.onUpdate(this.props.employee.id);
    }

    render() {

        var cells = Object.keys(this.props.attributes).map(attribute =>
            <td key={attribute}>{this.props.employee[attribute]}</td>
        );

        return (
            <tr>
                {cells}
                <td>
                    <UpdateDialog employee={this.props.employee} attributes={this.props.attributes} onUpdate={this.props.onUpdate}/>
                    <div style={{margin: "2px", display: "inline-block"}}></div>
                    <Button button={<button onClick={this.handleDelete} className={"icon delete"}>X</button>} tooltiptext="Delete"/>
                </td>
            </tr>
        )
    }
}

class UpdateDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = {active: false};
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSubmit(employee){
        employee.id = this.props.employee["id"];
        employee.timestamp = this.props.employee["timestamp"];

        this.props.onUpdate(employee);
    }

    render (){
        return(
            <div style={{display: "inline-block", float: "left"}}>
                <Button button={<img src={"static/edit.png"} alt={"Edit"} onClick={()=> {this.child.open()}} className={"icon"}/>} tooltiptext="Edit"></Button>

                <ModalDialog attributes={this.props.attributes} title="Edit" buttonTitle="Update"
                             defaultValues = {this.props.employee}
                             handleSubmit={this.handleSubmit} active={this.state.active}
                             ref={instance => { this.child = instance; }}/>
            </div>
        );
    }

}

class CreateDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = {active: false};
    }

    render () {
        return(
            <div>
                <button onClick={()=> {this.child.open()}}>Create</button>

                <ModalDialog attributes={this.props.attributes} title="Create new employee" buttonTitle="Create"
                             handleSubmit={this.props.onCreate} active={this.state.active}
                             ref={instance => { this.child = instance; }}/>
            </div>
        );
    }

}

class ModalDialog  extends React.Component{

    constructor(props){
        super(props);

        this.state = {
            active: props.active,
            isValid: {}
        };

        Object.keys(this.props.attributes).forEach(attribute => {
            this.state.isValid[attribute] = true;

            if (this.props.defaultValues !== undefined && this.props.defaultValues[attribute] !== undefined) {
                this.state[attribute] = this.props.defaultValues[attribute];
            } else {
                this.state[attribute] = "";
            }
        });

        this.close = this.close.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.isValidValue = this.isValidValue.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.restoreDefaultView = this.restoreDefaultView.bind(this);
    }

    componentDidUpdate(prevProps){
        if(JSON.stringify(this.props.defaultValues) != JSON.stringify(prevProps.defaultValues) ||
            JSON.stringify(prevProps.attributes) != JSON.stringify(this.props.attributes)) {
            this.restoreDefaultView();
        }
    }

    restoreDefaultView(){

        var isValid = {};
        Object.keys(this.props.attributes).forEach(attribute => {
            isValid[attribute] = true;

            if (this.props.defaultValues !== undefined && this.props.defaultValues[attribute] !== undefined) {
                this.setState({[attribute]: this.props.defaultValues[attribute]});
            } else {
                this.setState({[attribute]: ""});
            }
        });

        this.setState({isValid: isValid});
    }

    close(){
        this.restoreDefaultView();
        this.setState({active: false});
    }

    open(){
        this.setState({active: true});
    }

    handleSubmit(e) {
        e.preventDefault();

        //validate all fields
        var validationPassed = true;
        var isValid = this.state.isValid;
        Object.keys(this.props.attributes).forEach(attribute => {
            isValid[attribute] = this.isValidValue(this.state[attribute]);
            validationPassed &= isValid[attribute];
        });
        this.setState({isValid: isValid});

        if (validationPassed) {
            var newEmployee = {};
            Object.keys(this.props.attributes).forEach(attribute => {
                newEmployee[attribute] = this.state[attribute].trim();
            });

            // clear out the dialog's inputs
            Object.keys(this.props.attributes).forEach(attribute => {
                this.setState({[attribute]: ''});
            });

            this.close();

            this.props.handleSubmit(newEmployee);
        }
    }


    handleChange(e){
        var isValid = this.state.isValid;
        isValid[e.target.id] = true;
        this.setState({
            [e.target.id]: e.target.value,
            isValid: isValid
        });
    }

    //validate input on blur
    onBlur(e){
        var isValid = this.state.isValid;
        isValid[e.target.id] = this.isValidValue(e.target.value);
        this.setState({isValid: isValid});
    }

    isValidValue(value){
        return (value != undefined && value.trim().length > 0);
    }

    render() {
        var inputs = Object.keys(this.props.attributes).map(attribute => {
                /*var style = 'field';
                if(!this.state.isValid[attribute]){
                    style = style + ' invalidField';
                }*/
                return <div key={attribute}>
                    {/*<label htmlFor={attribute}>{this.props.attributes[attribute]}</label>
                        <input type="text" value={this.state[attribute]} onChange={this.handleChange} onBlur={this.onBlur}
                           placeholder={this.props.attributes[attribute]} id={attribute} className={style}/>*/}
                        <Input attibute={attribute} onChange={this.handleChange} value={this.state[attribute]} label={this.props.attributes[attribute]}
                               onBlur={this.onBlur} placeholder={this.props.attributes[attribute]} isValid={this.state.isValid[attribute]}/>
                </div>
            }
        );

        var style = "modalDialog";
        if(this.state.active){
            style += " modalDialogActive";
        }

        return (
            <div>
                <div className={style}>
                    <div>
                        <button onClick={this.close} title="Close" className="close">X</button>

                        <h2>{this.props.title}</h2>

                        <form>
                            {inputs}
                            <button onClick={this.handleSubmit}>{this.props.buttonTitle}</button>
                        </form>
                    </div>
                </div>
            </div>
        )
    }
}

class Input extends React.Component {

    constructor(props){
        super(props);

        this.onChange = this.onChange.bind(this);
    }

    onChange(e){
        this.props.onChange(e);
    }

    render(){
        var fieldStyle = 'field';
        var tooltipStyle='tooltiptext invalidMessageText';
        if(!this.props.isValid){
            fieldStyle = fieldStyle + ' invalidField';
        } else {
            tooltipStyle = tooltipStyle + ' inactive';
        }

        return (
            <div className={"tooltip input"}>
                <label htmlFor={this.props.attibute}>{this.props.label}</label>
                <input type="text" onChange={this.onChange} onBlur={this.props.onBlur} value={this.props.value}
                       placeholder={this.props.placeholder} id={this.props.attibute} className={fieldStyle}/>
                <span className={tooltipStyle}>Field should not be empty!</span>
            </div>
        )
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('react')
)