import { 
  Box,
  Heading,
} from '@chakra-ui/react'
import { MoteCamComponent } from './components/MoteCamComponent';
import { useLocale } from './hooks/useLocale';


export default function Face() {

  const { localizedStrings } = useLocale()

  return (
    <Box mx={'auto'} as='main' maxWidth={'420px'}>
      <Heading h={"40px"} my={4} w='100%' textAlign='center'>
        {localizedStrings.APP_TITLE}
      </Heading>
      <Box>
        <MoteCamComponent />
      </Box>
    </Box>   
  )
}
