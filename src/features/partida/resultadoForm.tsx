import { useState } from 'react'
import { useAppDispatch } from '../../app/hooks';
import { ButtonGroup, Button } from 'reactstrap'
import { toast } from "react-toastify";

import { PartidaType, handleResultado, getResultadosAsync, updateResultadoAsync } from './partidaSlice';
import moment from 'moment';

const ReadOnlyRow = (props: { idx: number, partida: PartidaType, edit: () => void }) => {
    const { idx, partida, edit } = props
    return (
        <tr key={partida._id} className='gridResultados'>
            <td className='text-center'>{idx + 1}</td>
            <td className='text-center'>
                <div className='rodada'>
                    <div className='nomeTimeA'>
                        <span className='h6 nomeTimeA'>{partida.timeA ? partida.timeA.sigla : ''}</span>
                    </div>
                    <div className='bandeiraTimeA'>
                        <i className={`bandeiraTimeA flag-icon flag-icon-${partida.timeA ? partida.timeA.bandeira : 'xx'}`} />
                    </div>
                    <div className='palpiteTimeA'>
                        {partida.placarTimeA}
                    </div>
                    <div className='divisorPalpite'>x</div>
                    <div className='palpiteTimeB'>
                        {partida.placarTimeB}
                    </div>
                    <div className='bandeiraTimeB'>
                        <i className={`bandeiraTimeB flag-icon flag-icon-${partida.timeB ? partida.timeB.bandeira : 'xx'}`} />
                    </div>
                    <div className='nomeTimeB'>
                        <span className='h6 nomeTimeB'>{partida.timeB ? partida.timeB.sigla : ''}</span>
                    </div>
                    <div className='horaPartida'>
                        <span className='horaPartida text-secundary'>{partida.data ? moment(partida.data).add(3, 'hours').format('DD/MM/YYYY HH:mm:ss') : ''}</span>
                    </div>
                </div>
            </td>
            <td className='text-center'>
                <ButtonGroup>
                    <Button className='text-white' size='sm' color='warning' onClick={edit}>
                        <i className='fas fa-edit'></i>
                    </Button>
                </ButtonGroup>
            </td>
        </tr>
    )
}

const EditableRow = (props: { idx: number, partida: PartidaType, handleChange: (event: any, partida: PartidaType) => void, update: (partida: PartidaType) => void, cancel: () => void }) => {
    const { idx, partida, handleChange, update, cancel } = props
    return (
        <tr key={partida._id} className='gridResultados'>
            <td className='text-center'>{idx + 1}</td>
            <td className='text-center'>
                <div className='rodada'>
                    <div className='nomeTimeA'>
                        <span className='h6 nomeTimeA'>{partida.timeA ? partida.timeA.sigla : ''}</span>
                    </div>
                    <div className='bandeiraTimeA'>
                        <i className={`bandeiraTimeA flag-icon flag-icon-${partida.timeA ? partida.timeA.bandeira : 'xx'}`} />
                    </div>
                    <div className='palpiteTimeA'>
                        <input name='placarTimeA' type='text' className='palpiteTimeA form-control' maxLength={1} value={partida.placarTimeA} onChange={event => handleChange(event, partida)} />
                    </div>
                    <div className='divisorPalpite'>x</div>
                    <div className='palpiteTimeB'>
                        <input name='placarTimeB' type='text' className='palpiteTimeB form-control' maxLength={1} value={partida.placarTimeB} onChange={event => handleChange(event, partida)} />
                    </div>
                    <div className='bandeiraTimeB'>
                        <i className={`bandeiraTimeB flag-icon flag-icon-${partida.timeB ? partida.timeB.bandeira : 'xx'}`} />
                    </div>
                    <div className='nomeTimeB'>
                        <span className='h6 nomeTimeB'>{partida.timeB ? partida.timeB.sigla : ''}</span>
                    </div>
                    <div className='horaPartida'>
                        <span className='horaPartida text-secundary'>{partida.data ? moment(partida.data).add(3, 'hours').format('DD/MM/YYYY HH:mm:ss') : ''}</span>
                    </div>
                </div>
            </td>
            <td className='text-center'>
                <ButtonGroup>
                    <Button size='sm' color='success' onClick={() => update(partida)}>
                        <i className='fas fa-check fa-fw'></i>
                    </Button>
                    <Button size='sm' color='danger' onClick={cancel}>
                        <i className='fas fa-times fa-fw'></i>
                    </Button>
                </ButtonGroup>
            </td>
        </tr>
    )
}

type PartidaFormType = {
    index: number,
    partida: PartidaType
}

const partidaForm = (props: PartidaFormType) => {
    const dispatch = useAppDispatch()
    const [isReadOnly, setIsReadOnly] = useState(true)
	const edit = () => {
        setIsReadOnly(false)
	}
	const cancel = () => {
        dispatch(getResultadosAsync())
		setIsReadOnly(true)
	}
	const update = (partida: PartidaType) => {
        dispatch(updateResultadoAsync({ partida, callback: () => {
            toast.success('Partida atualizado com sucesso!');
            setIsReadOnly(true)
        }}))
	}
    const handleChange = (event: any) => {
		event.preventDefault()
        const name = event.target.name
        const value = event.target.value
        dispatch(handleResultado({ partida, handle: {name, value }}))
	}
    const { index, partida } = props
    return isReadOnly ?
        <ReadOnlyRow key={partida._id} idx={index} partida={partida} edit={edit} /> :
        <EditableRow key={partida._id} idx={index} partida={partida} handleChange={handleChange} update={update} cancel={cancel} />
}

export default partidaForm