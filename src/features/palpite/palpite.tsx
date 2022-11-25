import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { Card, CardHeader, CardBody, Button } from 'reactstrap'
import { toast } from "react-toastify";

import moment from 'moment';
import If from '../../app/components/if';
import { getPalpitesAsync, selectGrupos, PalpiteType, handleGrupos, updatePalpitesAsync, selectTabIndex } from './palpiteSlice';
import { selectFase, selectFaseById } from '../fase/faseSlice';
import { selectAuthUser } from '../../app/auth/authSlice';

type InputType = HTMLInputElement | null

const palpite = () => {

    const { faseId } = useParams<{ faseId: string }>()
    const dispatch = useAppDispatch()

    const authUser = useAppSelector(selectAuthUser)
    const fase = useAppSelector(selectFase)
    const grupos = useAppSelector(selectGrupos)
    const tabIndex = useAppSelector(selectTabIndex)

    useEffect(() => {
        if (authUser) {
            dispatch(selectFaseById(faseId))
            dispatch(getPalpitesAsync({ userId: authUser._id!, faseId, callback: () => {}}))
        }
	}, [faseId])

    useEffect(() => {
        if (fase && fase.status === 'A') {
            focus()
        }
	})

    const handleKeyDown = (event: any, palpite: PalpiteType) => {
		const name: 'placarTimeA' | 'placarTimeB' = event.target.name;
		const tabIndex = event.target.tabIndex
		if (event.key === 'Backspace') {
			if (event.target.value === '') {
				if (tabIndex > 0) {
                    const newPalpite: PalpiteType = {...palpite}
                    newPalpite[name] = undefined
					dispatch(handleGrupos({ palpite: newPalpite, tabIndex: tabIndex - 1 }))
                    event.preventDefault()
				}
			}
		}
	}

    const handleChange = (event: any, palpite: PalpiteType) => {
		event.preventDefault()
		const name: 'placarTimeA' | 'placarTimeB' = event.target.name;
		const tabIndex = event.target.tabIndex
		let value = event.target.value
		if (value === '0' || value === '1' || value === '2' || value === '3' || value === '4' || value === '5' || value === '6' || value === '7' || value === '8' || value === '9' || value === '' || value === null || value === undefined) {
			value = (value === '' || value === undefined || value === null) ? undefined : Number(value)
            const newPalpite: PalpiteType = {...palpite}
            newPalpite[name] = value
            dispatch(handleGrupos({ palpite: newPalpite, tabIndex: value !== undefined ? tabIndex + 1 : tabIndex }))
		}
	}

    const handleClick = (event: any) => {
		event.preventDefault()
		let palpites: PalpiteType[] = []
        if (grupos) {
            grupos.forEach(grupo => {
                grupo.rodadas.forEach(rodada => {
                    rodada.palpites.forEach(palpite => {
                        palpites.push(palpite)
                    })
                })
            });
        }
		dispatch(updatePalpitesAsync({ palpites, userId: authUser!._id!, faseId: faseId, callback: () => {
            toast.success('Seus palpites foram salvos, agora é só torcer!');
        }}))
	}
	
    const focus = () => {
        inputTabIndex[tabIndex]?.focus()
	}

    let inputIndex = 0
    let inputTabIndex: InputType[] = []
    return (
        <div className='row'>
            <form style={{ width: '100%', height: '100%', display: 'contents' }}>
                <div className='col-12'>
                    <Card>
                        <CardHeader>
                            Preencha seus palpites e boa sorte!
                            <If test={fase !== undefined && fase.status === 'A'}>
                                <Button size='sm' color='success' className='float-right' onClick={handleClick}>
                                    <i className='fas fa-save'></i>  Salvar
                                </Button>
                            </If>
                        </CardHeader>
                        <CardBody className='p-0'>
                            <div className='row' style={{ margin: '0px' }}>
                                {grupos && grupos.map((grupo, idx) => {
                                    return (
                                        <div key={idx} className='col-sx-12 col-sm-12 col-md-6 col-lg-6 col-xl-4' style={{ padding: '0px' }}>
                                            <Card className='card-grupos'>
                                                <If test={grupo.nome !== 'SEM GRUPO'}>
                                                    <CardHeader className='text-center bg-light-blue text-white nomeGrupo'>{grupo.nome}</CardHeader>
                                                </If>
                                                <CardBody className='card-body-grupos'>
                                                    {grupo.rodadas.map((rodada, idx2) => {
                                                        return (
                                                            <div key={idx2}>
                                                                <If test={rodada.nome !== 'SEM RODADA'}>
                                                                    <div className='text-center bg-gray-200 nomeRodada'><strong>{rodada.nome}</strong></div>
                                                                </If>
                                                                {rodada.palpites.map((palpite, idx3) => {
                                                                    const timeAIndex = inputIndex++
                                                                    const timeBIndex = inputIndex++
                                                                    return (
                                                                        <div key={idx3 + '-' + palpite.placarTimeA + '-' + palpite.placarTimeB} className='bg-gray-100 rodada p-2'>
                                                                            <div className='nomeTimeA'>
                                                                                <span className='h6 nomeTimeA'>{palpite.partida!.timeA!.nome}</span>
                                                                            </div>
                                                                            <div className='bandeiraTimeA'>
                                                                                <i className={`bandeiraTimeA flag-icon flag-icon-${palpite.partida!.timeA!.bandeira}`} />
                                                                            </div>
                                                                            <div className='palpiteTimeA'>
                                                                                <input id={`${palpite._id}_timeA`} name={'placarTimeA'} type={'text'} className={'palpiteTimeA form-control'} maxLength={1} disabled={fase && fase.status !== 'A'} tabIndex={timeAIndex} ref={input => { inputTabIndex[timeAIndex] = input }} value={palpite.placarTimeA} onKeyDown={e => handleKeyDown(e, palpite)} onChange={e => handleChange(e, palpite)} />
                                                                            </div>
                                                                            <div className='divisorPalpite'>x</div>
                                                                            <div className='palpiteTimeB'>
                                                                                <input id={`${palpite._id}_timeB`} name={'placarTimeB'} type={'text'} className={'palpiteTimeB form-control'} maxLength={1} disabled={fase && fase.status !== 'A'} tabIndex={timeBIndex} ref={input => { inputTabIndex[timeBIndex] = input }} value={palpite.placarTimeB} onKeyDown={e => handleKeyDown(e, palpite)} onChange={e => handleChange(e, palpite)} />
                                                                            </div>
                                                                            <div className='bandeiraTimeB'>
                                                                                <i className={`bandeiraTimeB flag-icon flag-icon-${palpite.partida!.timeB!.bandeira}`} />
                                                                            </div>
                                                                            <div className='nomeTimeB'>
                                                                                <span className='h6 nomeTimeB'>{palpite.partida!.timeB!.nome}</span>
                                                                            </div>
                                                                            <div className='horaPartida'>
                                                                                <span className='horaPartida text-secundary'>{moment(palpite.partida!.data, 'YYYY/MM/DD HH:mm:ss').format('DD/MM/YYYY HH:mm')}</span>
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        )
                                                    })}
                                                </CardBody>
                                            </Card>
                                        </div>
                                    )
                                })}
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </form>
        </div>
    )
}

export default palpite