const filtrarPartidasPorFase = (partidas, fase) => {
	return partidas.filter(partida => {
		return partida.fase === fase
	})
}

const filtrarPartidasPorGrupo = (partidas, grupo) => {
	return partidas.filter(partida => {
		return partida.grupo === grupo
	})
}

const filtrarPartidasPorRodada = (partidas, rodada) => {
	return partidas.filter(partida => {
		return partida.rodada === rodada
	})
}

const descobrirRodadas = partidas => {
	const rodadas = []
	partidas.forEach(partida => {
		var index = rodadas.findIndex(rodada => rodada.nome === partida.rodada)
		if (index < 0) {
			rodadas[rodadas.length] = { nome: partida.rodada }
		}
	})
	return rodadas
}

const agruparPorRodadas = partidas => {
	const rodadas = descobrirRodadas(partidas)
	rodadas.forEach(rodada => {
		rodada.partidas = filtrarPartidasPorRodada(partidas, rodada.nome)
	})
	return rodadas
}

const descobrirGrupos = partidas => {
	const grupos = []
	partidas.forEach(partida => {
		var index = grupos.findIndex(grupo => grupo.nome === partida.grupo)
		if (index < 0) {
			grupos[grupos.length] = { nome: partida.grupo }
		}
	})
	return grupos
}

const agruparPorGrupos = partidas => {
	const grupos = descobrirGrupos(partidas)
	grupos.forEach(grupo => {
		grupo.rodadas = agruparPorRodadas(filtrarPartidasPorGrupo(partidas, grupo.nome))
	})
	return grupos
}

const popularTimes = (partidas, times) => {
	partidas.map(partida => {
		partida.timeA = times.find(time => time._id === partida.timeA)
		partida.timeB = times.find(time => time._id === partida.timeB)
		return partida
	})
	return partidas
}

const montarPartidas = (partidas, times, fase) => {
	const partidasComTimes = popularTimes(partidas, times)
	const partidasFiltradas = filtrarPartidasPorFase(partidasComTimes, fase)
	const grupos = agruparPorGrupos(partidasFiltradas)
	return grupos
}


export { montarPartidas, filtrarPartidasPorFase }