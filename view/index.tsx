import React, { useCallback, useEffect, useMemo, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { Graph } from './graph'
import { DataViewer } from './data-viewer'
import { Card, Container, Divider, Grid, IconButton, Paper, Slider, Stack } from '@mui/material'
import PauseIcon from '@mui/icons-material/Pause';
import SpeedIcon from '@mui/icons-material/Speed';
import { css, Global } from '@emotion/react'

const rust = import('../pkg')

export interface ViewState {
  clients: {
    id: string
    hash: string
    progress: number
  }[]
  messages: {
    from: string
    to: string
    progress: number
    kind: string
  }[]
  time: number
}

rust
  .then((m) => m.default)
  .then((m) => m.createSimulator())
  .then((simulator) => {
    const App = () => {
      const [state, setState] = useState<ViewState>()
      const [selectId, setSelectId] = useState<string | null>(null)
      const [speed, setSpeed] = useState<number>(10)
      const [isPause, setPause] = useState<boolean>(false)

      useEffect(() => {
        if (isPause) {
          return
        }
        let animationFrameRequest = 0
        let prevTime: number | null = null
        const loop = (time: DOMHighResTimeStamp) => {
          if (prevTime === null) {
            prevTime = time
          } else {
            simulator.tick(((time - prevTime) / 1000) * (speed / 10))
            const state = simulator.debug() as ViewState
            setState(state)
            prevTime = time
          }
          animationFrameRequest = requestAnimationFrame(loop)
        }
        animationFrameRequest = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(animationFrameRequest)
      }, [speed])

      const handleUpdateData = useCallback((id: string, k: string, v: string) => {
        simulator.set_kv(id, k, v)
      }, [])

      const handleSelectClient = useCallback((selectId: string) => {
        setSelectId(selectId)
      }, [])

      const handleSpeedChange = useCallback(
        (_: any, value: number | number[]) => {
          if (typeof value === 'number')
            setSpeed(
              Math.max(1, Math.min(100, value))
            )
        },
        []
      )

      const handleClickPause = useCallback(() => {
        setPause(!isPause)
      }, [isPause])

      if (state) {
        return (
          <Container maxWidth={false} disableGutters>
            <Grid container spacing={2} sx={{ width: '100%', margin: 0, minHeight: '100vh' }} >
              <Global styles={css`
              body {
                margin: 0;
              }
            `} />
              <Grid xs={12} md={4} lg sx={{ padding: '16px' }}>
                <h3>Gossip + CTDT Simulator</h3>
              </Grid>
              <Grid xs={12} md={5} lg={4} sx={{ padding: '16px' }}>
                <Stack spacing={2} direction="column">
                  <Card variant="outlined" sx={{ maxWidth: '300px' }} >
                    <Stack
                      divider={<Divider orientation="vertical" flexItem />}
                      spacing={2}
                      direction="row"
                      sx={{ m: 1 }}
                      alignItems="center"
                    >
                      <Stack spacing={2} sx={{ flexGrow: 1 }} direction="row" alignItems="center">
                        <SpeedIcon />
                        <Slider
                          aria-label="Speed"
                          value={speed}
                          min={1}
                          max={100}
                          onChange={handleSpeedChange}
                        />
                      </Stack>
                      <IconButton onClick={handleClickPause} aria-label="Pause">
                        <PauseIcon />
                      </IconButton>
                    </Stack>
                  </Card>
                  <Graph
                    state={{ ...state, selectId }}
                    onSelect={handleSelectClient}
                  />
                </Stack>
              </Grid>
              <Grid xs={12} md={3} sx={{ maxHeight: '100vh', padding: '16px 0' }}>
                <DataViewer
                  simulator={simulator}
                  state={state}
                  style={{ height: '100%' }}
                  onUpdate={handleUpdateData}
                />
              </Grid>
            </Grid>
          </Container >
        )
      }
      return <></>
    }

    ReactDOM.createRoot(document.body).render(<App />)
  })
  .catch(console.error)
