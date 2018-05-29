import PropTypes from 'prop-types';

const If = (props) => (props.test ? props.children : null)

If.propTypes = {
	test: PropTypes.bool,
	children: PropTypes.element.isRequired
};

export default If