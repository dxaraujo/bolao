import React from 'react';

type IfProps = {
	test: boolean
	children: React.ReactElement
}

const If = (props: IfProps): React.ReactElement | null => props.test ? props.children : null

export default If