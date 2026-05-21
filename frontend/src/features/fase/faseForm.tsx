import { useState } from 'react'
import { PhaseStatus } from '@bolao/shared'
import { useAppDispatch } from '../../app/hooks'
import { ButtonGroup, Button, Input } from 'reactstrap'
import { toast } from 'react-toastify'

import { rootUser } from '../../app/config/config'
import If from '../../app/components/if'

import { FaseType, handle, getFasesAsync, updateFaseAsync } from './faseSlice'
import { UserType } from '../user/userSlice'

const phaseStatusLabel: Record<PhaseStatus, string> = {
	[PhaseStatus.DISABLED]: 'D',
	[PhaseStatus.OPEN]: 'A',
	[PhaseStatus.BLOCKED]: 'B',
}

const ReadOnlyRow = (props: { user: UserType; idx: number; fase: FaseType; edit: () => void }) => {
	const { user, idx, fase, edit } = props
	return (
		<tr key={fase._id} className='gridFases'>
			<td className='text-center'>{idx + 1}</td>
			<td>{fase.name}</td>
			<td className='text-center'>{phaseStatusLabel[fase.status]}</td>
			<td className='text-center'>
				<If test={rootUser === user.email}>
					<Button className='text-white' size='sm' color='warning' onClick={edit}>
						<i className='fas fa-edit'></i>
					</Button>
				</If>
			</td>
		</tr>
	)
}

const EditableRow = (props: {
	user: UserType
	idx: number
	fase: FaseType
	handleChange: (event: React.ChangeEvent<HTMLInputElement>, fase: FaseType) => void
	update: (fase: FaseType) => void
	cancel: () => void
}) => {
	const { user, idx, fase, handleChange, update, cancel } = props
	return (
		<tr key={fase._id} className='gridFases'>
			<td className='text-center'>{idx + 1}</td>
			<td>{fase.name}</td>
			<If test={rootUser === user.email}>
				<td className='text-center'>
					<Input
						id='status'
						name='status'
						type='select'
						value={fase.status}
						onChange={(event) => handleChange(event, fase)}
					>
						<option value={PhaseStatus.DISABLED}>D</option>
						<option value={PhaseStatus.OPEN}>A</option>
						<option value={PhaseStatus.BLOCKED}>B</option>
					</Input>
				</td>
			</If>
			<If test={rootUser !== user.email}>
				<td className='text-center'>{phaseStatusLabel[fase.status]}</td>
			</If>
			<td className='text-center'>
				<ButtonGroup>
					<Button size='sm' color='success' onClick={() => update(fase)}>
						<i className='fas fa-check fa-fw'></i>
					</Button>
					<Button size='sm' color='danger' onClick={() => cancel()}>
						<i className='fas fa-times fa-fw'></i>
					</Button>
				</ButtonGroup>
			</td>
		</tr>
	)
}

type FaseFormType = {
	index: number
	user: UserType
	fase: FaseType
}

const faseForm = (props: FaseFormType) => {
	const dispatch = useAppDispatch()
	const [isReadOnly, setIsReadOnly] = useState(true)
	const edit = () => {
		setIsReadOnly(false)
	}
	const cancel = () => {
		dispatch(getFasesAsync())
		setIsReadOnly(true)
	}
	const update = (fase: FaseType) => {
		dispatch(
			updateFaseAsync({
				fase,
				callback: () => {
					toast.success('Fase atualizado com sucesso!')
					setIsReadOnly(true)
				},
			}),
		)
	}
	const handleChange = (event: React.ChangeEvent<HTMLInputElement>, fase: FaseType) => {
		event.preventDefault()
		const name = event.target.name as '_id' | 'status'
		const value = Number(event.target.value) as PhaseStatus
		dispatch(handle({ fase, handle: { name, value } }))
	}
	const { index, fase, user } = props
	return isReadOnly ? (
		<ReadOnlyRow key={fase._id} idx={index} fase={fase} user={user} edit={edit} />
	) : (
		<EditableRow
			key={fase._id}
			idx={index}
			fase={fase}
			user={user}
			handleChange={handleChange}
			update={update}
			cancel={cancel}
		/>
	)
}

export default faseForm
